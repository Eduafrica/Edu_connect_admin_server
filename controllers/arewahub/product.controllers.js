import { generateUniqueCode } from "../../middlewares/utils.js"
import ProductModel from "../../models/arewahub/Product.js"
import cloudinary from "cloudinary";

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

//ADD PRODUCT
export async function addProdcut(req, res) {
    const { productName, quantityInStock, price, description, image } = req.body
    if(!productName){
        return res.status(400).json({ success: true, data: 'Provide a product name' })
    }
    if(!quantityInStock || quantityInStock < 0 ){
        return res.status(400).json({ success: false, data: 'A minimium quantity in stock greater than 0 is required' })
    }
    if(!price){
        return res.status(400).json({ success: false, data: 'Product price is required' })
    }
    try {
        const productCode = await generateUniqueCode(8)
        console.log('PROJECT ID', productCode)
        
        let imageUrl
        if(image){
            const result = await cloudinary.uploader.upload(image)

            imageUrl = result.url
        }

        const newProduct = await ProductModel.create({
            productName, productId: productCode, quantityInStock, price, description, image: imageUrl
        })
        
        res.status(201).json({ success: true, data: 'New Product created' })
    } catch (error) {
        console.log('UNABLE TO CREATE PRODUCT', error)
        res.status(500).json({ success: false, data: 'Unable to create product' })
    }
}

export async function editProduct(req, res) {
    const { _id, productName, quantityInStock, price, description, image } = req.body

    try {
        const getProduct = await ProductModel.findOne({ productId: _id })
        if(!getProduct){
            return res.status(404).json({ success: false, data: 'Product not found' })
        }

        let imageUrl
        if(image){
            const result = await cloudinary.uploader.upload(image)

            imageUrl = result.url
        }

        const updateProduct = await ProductModel.findByIdAndUpdate(
            getProduct?._id, 
            {
                $set: {
                    productName,
                    quantityInStock,
                    price,
                    description,
                    image: imageUrl
                },
            },
            { new: true }
        )

        res.status(201).json({ success: true, data: 'Product Updated.' })
    } catch (error) {
        console.log('UNABLE TO UPDATE PRODUCT', error)
        res.status(500).json({ success: false, data: 'Unable to update product' })
    }
}

export async function getAllProduct(req, res) {
    try {
        const allProduct = await ProductModel.find().select('-_id')

        res.status(200).json({ success: true, data: allProduct })
    } catch (error) {
        console.log('UNABLE TO GET ALL PRODUCT', error)
        res.status(500).json({ success: false, data: 'Unable to get all product' })
    }
}

export async function getAProduct(req, res) {
    const { id } = req.params
    if(!id){
        return res.status(400).json({ success: false, data: 'Product ID is requried' })
    }
    try {
        const product = await ProductModel.findOne({ productId: id })
        if(!product){
            return res.status(404).json({ success: false, data: 'Product not found' })
        }

        res.status(200).json({ success: false, data: product })
    } catch (error) {
        console.log('UNABLE TO GET PRODUCT', error)
        res.status(500).json({ success: false, data: 'Unable to get product' })
    }
}

export async function deleteProduct(req, res) {
    const { id } = req.body
    if(!id){
        return res.status(400).json({ success: false, data: 'Product ID is requried' })
    }
    try {
        const product = await ProductModel.findOne({ productId: id })
        if(!product){
            return res.status(404).json({ success: false, data: 'Product not found' })
        }

        const deleteProduct = await ProductModel.findOneAndUpdate({ _id: id })

        res.status(200).json({ success: false, data: 'Product Deleted successful' })
    } catch (error) {
        console.log('UNABLE TO DELETE PRODUCT', error)
        res.status(500).json({ success: false, data: 'Unable to delete product' })
    }
}

export async function toggleActiveStatus(req, res) {
    const { id } = req.body
    if(!id){
        return res.status(400).json({ success: false, data: 'Product ID is requried' })
    }
    try {
        const product = await ProductModel.findOne({ productId: id })
        if(!product){
            return res.status(404).json({ success: false, data: 'Product not found' })
        }

        product.active = !product.active
        await product.save()

        res.status(200).json({ success: false, data: 'Product updated' })
    } catch (error) {
        console.log('UNABLE TO UPDATE PRODUCT ACTIVE STATUS', error)
        res.status(500).json({ success: false, data: 'Unable to update product active status' })
    }
}