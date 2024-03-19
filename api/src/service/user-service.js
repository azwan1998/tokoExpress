import { validate } from "../validation/validation.js";
import { getIdUserValidation, isActiveUserValidation, listUserValidation, loginUserValidation, passwordUserValidation, registerUserValidation } from "../validation/user-validation.js";
import { prismaClient } from "../app/database.js";
import { ResponseError } from "../error/response-error.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const register = async (request) => {
    const user = validate(registerUserValidation, request);

    const countUser = await prismaClient.user.count({
        where:{
            email: user.email
        }
    });

    if (countUser === 1){
        throw new ResponseError(400, "email already exists");
    }

    user.password = await bcrypt.hash("12345678", 10);
    user.isActive = true;

    return prismaClient.user.create({
        data: user,
        select: {
            email: true,
            role: true,
            isActive: true
        }
    });
}

const login = async (request) => {
    const loginUser = validate(loginUserValidation, request);
    console.log(loginUser);

    const user = await prismaClient.user.findFirst({
        where: {
            email: loginUser.email
        },
    });

    if (user.isDeleted === true) {
        throw new ResponseError(401, "Your account has deleted");
    }

    if (!user || !(await bcrypt.compare(loginUser.password, user.password))) {
        throw new ResponseError(401, "Invalid email or password");
    }

    if (user.isActive === false) {
        throw new ResponseError(401, "Your account is not active");
    }

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "24h" });

    return {
        token,
        user: {
            email: user.email,
            role: user.role,
        },
    };
}

const resetPassword = async (userId) => {
    const user = validate(getIdUserValidation, userId);
    const checkUser = await prismaClient.user.count({
        where: {
            id: user.id,
        }
    });

    if (!checkUser) {
        throw new ResponseError(401, "User not found");
    }

    user.password = await bcrypt.hash("12345678", 10);

    return prismaClient.user.update({
        where: {
            id: user.id,
        },
        data: {
            password: user.password,
        }
    });
}

const isActive = async (request) => {
    const user = validate(isActiveUserValidation, request);
    const checlUser = await prismaClient.user.count({
        where: {
            id: user.id
        }
    });

    if (checlUser !== 1) {
        throw new ResponseError(401, "User not found");
    }

    return prismaClient.user.update({
        where: {
            id: user.id
        },
        data: {
            isActive: user.isActive,
        },
        select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
        },
    });
}

const listUser = async (request) => {
    request = validate(listUserValidation, request);

    const skip = (request.page - 1) * request.size;

    const filters = [];

    if (request.role) {
        filters.push({
            role: {
                equals: request.role
            }
        });
    }

    if (request.isActive) {
        filters.push({
            isActive: {
                equals: request.isActive
            }
        });
    }

    if (request.email) {
        filters.push({
            email: {
                contains: request.email
            }
        });
    }

    filters.push({
        isDeleted: {
            equals: false
        }
    });

    const users = await prismaClient.user.findMany({
        where: {
            AND: filters
        },
        take: request.size,
        skip: skip,
        select:{
            id: true,
            email: true,
            isActive: true,
            role: true,
            created_at: true,
            updated_at: true,
        }
    });

    const totalItems = await prismaClient.user.count({
        where: {
            AND: filters
        }
    });

    return {
        data: users,
        paging: {
            page: request.page,
            total_item: totalItems,
            total_page: Math.ceil(totalItems / request.size)
        }
    }
}

const deleteUser = async (userId) => {
    const user = validate(getIdUserValidation, userId);
    const checkUser = await prismaClient.user.count({
        where: {
            id: user.id,
        }
    });

    if (!checkUser) {
        throw new ResponseError(401, "User not found");
    }

    console.log(user.id);

    return prismaClient.user.update({
        where: {
            id: user.id,
        },
        data: {
            isDeleted: true,
        }
    });
}

const changePassword = async (request) => {
    request = validate(passwordUserValidation, request);
    request.password = await bcrypt.hash(request.password, 10);

    return prismaClient.user.update({
        where: {
            id: request.id
        },
        data: {
            password: request.password,
            email: request.email
        },
        select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
        },
    });
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