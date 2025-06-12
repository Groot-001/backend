const projectModel = require('../Models/projectModel');

exports.createProject = async (req, res) => {
    try {
        const { title, category, description, roles } = req.body;

        if (!title) {
            return res.status(400).json({ error: "Please enter a title" })
        }

        if (!category) {
            return res.status(400).json({ error: "Category is required" })
        }

        if (!description) {
            return res.status(400).json({ error: "Description about the project is required" })
        }
        if (!roles) {
            return res.status(400).json({ error: "Please provide the required roles for the Project" })
        }

        const existingProject = await projectModel.findOne({ title })

        if (existingProject) {
            return res.status(400).json({ error: "Title already Taken" })
        }

        const newProject = await projectModel.create({
            title,
            category,
            description,
            roles,
            createdBy: req.user._id
        })

        res.status(200).json({ success: "New Project Created Successfully", project: newProject })

    }
    catch (error) {
        console.log("Project creation error", error)
        return res.status(500).json({ error: "Internal server error" })
    }
}

exports.getAllProjects = async (req, res) => {
    try {
        const getAllProjects = await projectModel.find().populate('createdBy', 'userName')

        if (!getAllProjects || getAllProjects.length === 0) {
            return res.status(200).json({ message: "No Products Found" })
        }

        return res.status(200).json({ message: "Fetching project Successful", projects: getAllProjects });
    }
    catch (error) {
        console.log("Project Fetching error", error)
        return res.status(500).json({ error: "Internal server error" })
    }
}

exports.getUserProjects = async (req, res) => {
    try {
        const userId = req.user._id

        const userProjects = await projectModel
            .find({ createdBy: userId })
            .populate('createdBy', 'userName')
            .populate('pendingRequests.user', 'userName')
            .populate('members.user', 'userName')

        if (!userProjects) {
            return res.status(200).json({ message: "No projects found for this user." });
        }

        if (userProjects.length === 0) {
            return res.status(200).json({ error: "Not Created any projects." });
        }

        res.status(200).json({ message: "Successfull getting projects", projects: userProjects });

    }
    catch (error) {
        console.log("Getting UserProjects error", error)
        return res.status(500).json({ error: "Internal server error" })
    }
}

exports.updateProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { title, category, description, roles } = req.body

        if (!projectId) {
            return res.status(400).json({ error: "Project ID is required for update." });
        }

        const project = await projectModel.findOne({ _id: projectId, createdBy: req.user._id })

        if (!project) {
            return res.status(403).json({ error: "You are not authorized to Update it" })
        }

        const updates = {};
        if (title) updates.title = title;
        if (category) updates.category = category;
        if (description) updates.description = description;
        if (roles) updates.roles = roles;

        const updateProjects = await projectModel.findByIdAndUpdate(
            projectId,
            updates,
            { new: true, runValidators: true }
            // runValidators is used to validate the schema while updating
        )

        if (!updateProjects) {
            return res.status(400).json({ error: "Project update failed." });
        }

        res.status(200).json({ message: "Project Updated Successfully", projects: updateProjects })

    }
    catch (error) {
        console.log("Updating Projects error", error)
        return res.status(500).json({ error: "Internal server error" })
    }
}

exports.deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        if (!projectId) {
            return res.status(400).json({ error: "Project ID is required for deletion." });
        }

        const project = await projectModel.findOne({ _id: projectId, createdBy: req.user._id })

        if (!project) {
            return res.status(403).json({ error: "You are not authorized to delete it" })
        }

        const deleteProjects = await projectModel.findByIdAndDelete(projectId)

        if (!deleteProjects) {
            return res.status(400).json({ error: "Project deletion failed" })
        }

        res.status(200).json({ message: "Deletion successful " })
    }
    catch (error) {
        console.log("Project Deletion error", error)
        return res.status(500).json({ error: "Internal server error" })
    }
}

exports.joinProjectRequest = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { role } = req.body;
        const userId = req.user._id;

        if (!role) {
            return res.status(400).json({ error: "Role is required." });
        }

        const project = await projectModel.findById(projectId);

        if (!project) {
            return res.status(404).json({ error: "Project not found." });
        }

        if (!project.roles.includes(role)) {
            return res.status(400).json({ error: "Invalid role selected." });
        }

        if (project.createdBy.toString() === userId.toString()) {
            return res.status(400).json({ error: "You cannot join your own project." });
        }

        const alreadyRequested = project.pendingRequests.some(
            (req) => req.user.toString() === userId.toString()
        );
        if (alreadyRequested) {
            return res.status(409).json({ error: "You have already requested to join this project." });
        }

        const alreadyMember = project.members.some(
            (member) => member.user.toString() === userId.toString()
        );
        if (alreadyMember) {
            return res.status(409).json({ error: "You are already a member of this project." });
        }

        project.pendingRequests.push({ user: userId, role, requestedAt: new Date(), });
        await project.save();

        res.status(200).json({ success: "Join request sent successfully." });
    } catch (error) {
        console.error("Join Project Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

exports.getAppliedProjects = async (req, res) => {
    try {
        const userId = req.user._id.toString();

        const appliedProjects = await projectModel.find({
            "pendingRequests.user": userId
        })
            .populate("createdBy", "userName")
            .populate("members.user", "userName")
            .populate("pendingRequests.user", "userName")
            .lean();

        const formattedProjects = appliedProjects.map(project => {
            const pendingRequest = project.pendingRequests.find(
                (req) => req.user._id.toString() === userId
            );

            return {
                ...project,
                appliedRole: pendingRequest?.role || null
            };
        });

        res.status(200).json({
            message: "Fetched applied projects successfully.",
            projects: formattedProjects,
        });
    } catch (error) {
        console.error("Error fetching applied projects:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


exports.cancelJoinRequest = async (req, res) => {
    try {
        const userId = req.user._id;
        const { projectId } = req.body;

        if (!projectId) {
            return res.status(400).json({ error: "Project ID is required." });
        }

        const project = await projectModel.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: "Project not found." });
        }

        const requestIndex = project.pendingRequests.findIndex(
            (req) => req.user.toString() === userId.toString()
        );

        if (requestIndex === -1) {
            return res.status(404).json({ error: "No pending request found for this user." });
        }

        project.pendingRequests.splice(requestIndex, 1);
        await project.save();

        res.status(200).json({ message: "Join request cancelled successfully." });
    } catch (error) {
        console.error("Error cancelling join request:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

exports.getPendingRequests = async (req, res) => {
    try {
        const userId = req.user._id;

        const projects = await projectModel.find({ createdBy: userId })
            .populate("createdBy", "userName")
            .populate("members.user", "userName")
            .populate({
                path: "pendingRequests.user",
                select: "userName email"
            });

        const filtered = projects.filter(project => project.pendingRequests.length > 0);

        const formatted = filtered.map(project => ({
            _id: project._id,
            title: project.title,
            category: project.category,
            description: project.description,
            createdBy: project.createdBy,
            members: project.members,
            pendingRequests: project.pendingRequests.map(req => ({
                user: req.user,
                role: req.role
            }))
        }));

        return res.status(200).json({ projects: formatted });

    } catch (error) {
        console.error("Error fetching pending requests:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


exports.handleJoinRequest = async (req, res) => {
    try {
        const { projectId, targetUserId, action } = req.body;

        if (!projectId || !targetUserId || !action) {
            return res.status(400).json({ error: "Project ID, User ID, and action are required." });
        }

        const project = await projectModel.findOne({ _id: projectId, createdBy: req.user._id });

        if (!project) {
            return res.status(403).json({ error: "You are not authorized to manage requests for this project." });
        }

        const requestIndex = project.pendingRequests.findIndex(
            (req) => req.user.toString() === targetUserId
        );

        if (requestIndex === -1) {
            return res.status(404).json({ error: "No pending request found for this user." });
        }

        if (action === "approve") {
            const request = project.pendingRequests[requestIndex];

            project.members.push({
                user: targetUserId,
                role: request.role,
                joinedAt: new Date()
            });


            project.pendingRequests.splice(requestIndex, 1);
            await project.save();

            return res.status(200).json({ message: "User approved and added to the project." });

        } else if (action === "reject") {
            project.pendingRequests.splice(requestIndex, 1);
            await project.save();

            return res.status(200).json({ message: "User's join request has been rejected." });
        } else {
            return res.status(400).json({ error: "Invalid action. Must be 'approve' or 'reject'." });
        }

    } catch (error) {
        console.log("Handle join request error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};








