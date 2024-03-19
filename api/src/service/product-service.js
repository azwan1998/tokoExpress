import { validate } from "../validation/validation.js";
import { prismaClient } from "../app/database.js";
import { ResponseError } from "../error/response-error.js";
import {
  addProductValidaton,
  getProductValidaton,
  updateProductValidaton,
} from "../validation/product-validation.js";
import fs from "fs/promises";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { request } from "http";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/products");
  },
  filename: function (req, file, cb) {
    const uniqueFileName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFileName);
  },
});

const uploadProductFoto = multer({ storage: storage });

const addProduct = async (request) => {
  const productData = validate(addProductValidaton, request);

  const checkProduct = await prismaClient.product.count({
    where: {
      productName: productData.productName,
    },
  });

  if (checkProduct !== 0) {
    throw new ResponseError(400, "Product Already Exists");
  }

  return prismaClient.product.create({
    data: productData,
    select: {
      id: true,
      productName: true,
      harga:true,
      foto: true,
      created_at: true,
      updated_at: true,
    },
  });
};

const updateProduct = async (request) => {
  const productData = validate(updateProductValidaton, request);

  const checkProduct = await prismaClient.product.findFirst({
    where: {
      id: productData.id,
    },
    select: {
      id: true,
      productName: true,
      harga:true,
      foto: true,
    },
  });

  if (!checkProduct) {
    throw new ResponseError(400, "Product not Found");
  }

  const result = await prismaClient.product.update({
    where: {
      id: productData.id,
    },
    data: {
      productName: productData.productName,
      harga: productData.harga,
      foto: request.foto !== undefined ? request.foto : checkProduct.foto,
    },
  });

  if (request.foto !== undefined && checkProduct.foto !== null) {
    const oldfotoPath = path.join(
      process.cwd(),
      "public/uploads/products",
      checkProduct.foto
    );

    await fs.unlink(oldfotoPath);
  }

  return result;
};

const deleteProduct = async (request) => {
  const productData = validate(getIdProductValidaton, request);

  const checkProduct = await prismaClient.product.findFirst({
    where: {
      id: productData.id,
    }
  });

  if (!checkProduct) {
    throw new ResponseError(400, "Product Not Found");
  }

  return prismaClient.product.update({
    where: {
      id: productData.id,
    },
    data: {
      isDeleted: true,
    }
  });
};

const getProduct = async (request) => {
  const productData = validate(getProductValidaton, request);

  console.log(productData);
  const skip = (productData.page - 1) * productData.size;

  const filters = [];

  if (request.productName) {
    filters.push({
      productName: {
        contains: request.productName,
      },
    });
  }

  filters.push({
    isDeleted: {
      equals: false,
    },
  });

  const products = await prismaClient.product.findMany({
    where: {
      AND: filters,
    },
    take: productData.size,
    skip: skip,
    select: {
      id: true,
      productName: true,
      foto: true,
      harga:true,
      created_at: true,
      updated_at: true,
    },
  });

  products.forEach((product) => {
    if (product.foto) {
      product.foto = `${process.env.BASE_URL}/uploads/products/${product.foto}`;
    }
  });

  const totalItems = await prismaClient.product.count({
    where: {
      AND: filters,
    },
  });

  return {
    data: products,
    paging: {
      page: productData.page,
      total_item: totalItems,
      total_page: Math.ceil(totalItems / productData.size),
    },
  };
};

export { uploadProductFoto };
export default {
  addProduct,
  updateProduct,
  deleteProduct,
  getProduct,
};
