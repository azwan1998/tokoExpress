import express from "express";
import userController from "../controller/user-controller.js";
import {authenticateToken,checkUserRole} from "../middleware/auth-middleware.js";
import productController from "../controller/product-controller.js";

const userRouter = new express.Router();
userRouter.use(authenticateToken);

// USER API
userRouter.post('/api/users', checkUserRole(["admin"]),userController.register);
userRouter.patch('/api/users/resetPassword/:id',checkUserRole(["admin"]), userController.resetPassword);
userRouter.patch('/api/users/isActive/:id',checkUserRole(["admin"]), userController.isActive);
userRouter.get('/api/users/',checkUserRole(["admin"]), userController.listUser);
userRouter.patch('/api/users/changePassword', checkUserRole(["admin","user"]),userController.changePassword);
userRouter.delete('/api/users/delete/:id', checkUserRole(["admin"]),userController.deleteUser);

//PRODUCT API
userRouter.post('/api/products/', checkUserRole(["admin"]),productController.addProduct);
userRouter.patch('/api/products/update/:id', checkUserRole(["admin"]),productController.updateProduct);
userRouter.delete('/api/products/delete/:id', checkUserRole(["admin"]),productController.deleteProduct);
userRouter.get('/api/products/', checkUserRole(["admin","user"]),productController.getProduct);


export {
    userRouter,
}