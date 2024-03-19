import { ResponseError } from "../error/response-error.js";
import productService from "../service/product-service.js";
import { uploadProductFoto } from "../service/product-service.js";

const addProduct = async (req, res, next) => {
  try {
    uploadProductFoto.single("foto")(req, res, (err) => {
      if (err) {
        return next(new ResponseError(400, err.message));
      }

      const request = {
        productName: req.body.productName,
        harga: req.body.harga,
        foto: req.file ? req.file.filename : undefined,
      };

      productService
        .addProduct(request)
        .then((result) => {
          res.status(200).json({ 
            code:200,
            message:"add product successfully",
            data: result 
          });
        })
        .catch((error) => {
          next(error);
        });
    });
  } catch (e) {
    next(e);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    uploadProductFoto.single("foto")(req, res, (err) => {
      if (err) {
        return next(new ResponseError(400, err.message));
      }

      const request = {
        id: req.params.id,
        productName: req.body.productName,
        harga: req.body.harga,
        foto: req.file ? req.file.filename : undefined,
      };

      productService
        .updateProduct(request)
        .then((result) => {
          res.status(201).json({ 
            code:200,
            message:"product updated successfully",
            data: result 
          });
        })
        .catch((error) => {
          next(error);
        });
    });
  } catch (e) {
    next(e);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const request = {
      id: req.params.id,
    };

    const result = await productService.deleteProduct(request);

    res.status(204).json(result);
  } catch (e) {
    next(e);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const request = {
      productName: req.query.productName,
    };

    const result  = await productService.getProduct(request);

    res.status(200).json({
      code:200,
      message:"get product successfully",
      data:result
    });
  } catch (e) {
    next(e);
  }
};

export default {
  addProduct,
  updateProduct,
  deleteProduct,
  getProduct,
};
