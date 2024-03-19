import { createLogger } from "winston";
import userService from "../service/user-service.js";

const register = async (req, res, next) => {
    try {
      const result = await userService.register(req.body);
      res.status(200).json({
        code:200,
        message:"user created successFully",
        data:result
      });
    } catch (e) {
        next(e);
    }
}

const login = async (req, res, next) => {
    try {
        const result = await userService.login(req.body);
        res.status(200).json({
            code:200,
            message:"login successFully",
            data: result,
        });
    } catch (e) {
        next(e);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const userId = req.params;
        await userService.resetPassword(userId);
        res.status(201).json({
            code:201,
            message: "Password reset successful"
        });
    } catch (e) {
        next(e);        
    }
}

const deleteUser = async (req, res, next) => {
    try {
        const userId = req.params;
        await userService.deleteUser(userId);
        res.status(201).json({
            code:201,
            message: "user deleted successful"
        });
    } catch (e) {
        next(e);        
    }
}

const isActive = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const request = req.body;
        request.id = userId;
        const result = await userService.isActive(request);
        res.status(200).json({ 
            code:200,
            message:"user status edited successFully",
            data: result 
        });
    } catch (e) {
        next(e);
    }
}

const listUser = async (req, res, next) => {
    try {
        const request = {
            email: req.query.email,
            isActive: req.query.isActive,
            role: req.query.role,
            page: req.query.page,
            size: req.query.size
        };

        const result = await userService.listUser(request);
        res.status(200).json({ 
            code:200,
            message:"list user",
            data: result 
        });
    } catch (e) {
        next(e);
    }
}

const changePassword = async (req, res, next) => {
    try {
        const user = req.user.userId;
        const request = req.body;
        request.id = user;

        const result = await userService.changePassword(request);
        res.status(200).json({
            code:200,
            message:"change password successFully",
            data: result
        });
    } catch (e) {
        next(e);
    }
}

export default {
    register,
    login,
    resetPassword,
    isActive,
    listUser,
    changePassword,
    deleteUser,
}