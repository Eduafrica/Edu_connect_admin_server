import ArewaHubMemberModel from "../../models/arewahub/members.js"

import { v2 as cloudinary } from "cloudinary";

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function becomeAMember(req, res) {
    const { firstName, lastName, email, mobileNumber, location, bussinessName, craftType, experienceLevel } = req.body
    if(!firstName){
        return res.status(400).json({ success: false, data: 'First name is required'})
    }
    if(!lastName){
        return res.status(400).json({ success: false, data: 'Last name is required'})
    }
    if(!mobileNumber){
        return res.status(400).json({ success: false, data: 'Mobile number is required'})
    }
    
    const { certificateImage, artWorkGallery } = req.files || req.body || {}
    
    if(artWorkGallery && !Array.isArray(artWorkGallery)){
        return res.status(400).json({ success: false, data: 'artWorkGallery must be an array'})
    }

    try {
        if(email){
            const emailExist = await ArewaHubMemberModel.findOne({ email })
            if(emailExist){
                return res.status(400).json({ success: false, data: 'Email already exist'})
            }
        }
        if(mobileNumber){
            const mobileNumberExist = await ArewaHubMemberModel.findOne({ mobileNumber })
            if(mobileNumberExist){
                return res.status(400).json({ success: false, data: 'Mobile numeber already exist'})
            }
        }

        console.log('FILES', req.files, 'BODY', req.body, 'CERT', req.body.certificateImage)
        
        let certificateImageUrl = null
        if(req?.files?.certificateImage || req?.body?.certificateImage) {
            const file = certificateImage[0];

            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "arewahubmember_certificate" },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                uploadStream.end(file.buffer);
            });

            certificateImageUrl = uploadResult.secure_url;
            console.log('New hub member certificate image url:', certificateImageUrl)
        }

        let artWorkGalleryUrls = []
        const imageArray = req?.files?.artWorkGallery || req?.body?.artWorkGallery
        if ( imageArray && Array.isArray(imageArray)) {
            artWorkGalleryUrls = await Promise.all(
                imageArray.map((file) =>
                    new Promise((resolve, reject) => {
                        const uploadStream = cloudinary.uploader.upload_stream(
                            { folder: "arewahubmember_craft_gallery" },
                            (error, result) => {
                                if (error) return reject(error);
                                resolve(result.secure_url);
                            }
                        );
                        uploadStream.end(file.buffer);
                    })
                )
            );
            console.log('New gallery image url:', artWorkGalleryUrls)
        }

        const newMember = await ArewaHubMemberModel.create({
            firstName,
            lastName,
            email,
            mobileNumber,
            location: location || '',
            bussinessName: bussinessName || '',
            craftType: craftType || '',
            experienceLevel: experienceLevel || '',
            certificateImage: certificateImageUrl || '',
            artWorkGallery: artWorkGalleryUrls || []
        })
        console.log('newMember', newMember)
        res.status(201).json({ success: true, data: 'Membership account created succesful'})
    } catch (error) {
        console.log('UNABLE TO ADD NEW MEMEBER ON AREWA HUB',error)
        res.status(500).json({ success: false, data: 'Unable to add members on arewa hub team member' })
    }
}

//GET MEMBERS
export async function getMembers(req, res) {
    try {
        const members = await ArewaHubMemberModel.find()

        res.status(200).json({ success: true, data: members })
    } catch (error) {
        console.log('UNABLE TO GET MEMBERS OF AREWA HUB', error)
        res.status(500).json({ success: false, data: 'Unable to get members' })
    }
}