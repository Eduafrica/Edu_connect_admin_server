import mongoose from "mongoose";

const FaqSchema = new mongoose.Schema({
    faqs: [
        {
            question: {
                type: String
            },
            answer: {
                type: String
            },
            active: {
                type: Boolean,
                default: true
            }
        }
    ]
},
{ timestamps: true }
)

const FaqModel = mongoose.model('arewahubfaq', FaqSchema)
export default FaqModel