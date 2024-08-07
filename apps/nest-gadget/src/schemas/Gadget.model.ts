import { Schema } from 'mongoose';
import { GadgetLocation, GadgetStatus, GadgetType } from '../libs/enums/gadget.enum';

const GadgetSchema = new Schema(
	{
		gadgetType: {
			type: String,
			enum: GadgetType,
			required: true,
		},

		gadgetStatus: {
			type: String,
			enum: GadgetStatus,
			default: GadgetStatus.ACTIVE,
		},

		gadgetLocation: {
			type: String,
			enum: GadgetLocation,
			required: true,
		},
//gadgetAddress
		gadgetColor: {
			type: String,
			required: true,
		},

		gadgetTitle: {
			type: String,
			required: true,
		},

		gadgetPrice: {
			type: Number,
			required: true,
		},
//gadgetSquare
/* 		gadgetDisplaySquare: {
			type: Number,
			required: true,
		}, */
// bed
		gadgetWeight: {
			type: Number,
			required: true,
		},
//gadgetRooms
		gadgetCapacity: {
			type: Number,
			required: true,
		},

		gadgetViews: {
			type: Number,
			default: 0,
		},

		gadgetLikes: {
			type: Number,
			default: 0,
		},

		gadgetComments: {
			type: Number,
			default: 0,
		},

		gadgetRank: {
			type: Number,
			default: 0,
		},

		gadgetImages: {
			type: [String],
			required: true,
		},

		gadgetDesc: {
			type: String,
		},

/* 		gadgetUsed: {
			type: Boolean,
			default: false,
		},

		gadgetNew: {
			type: Boolean,
			default: false,
		}, */

		memberId: {
			type: Schema.Types.ObjectId, // kim kiritganligni ozida saqlaydi
			required: true,
			ref: 'Member',
		},

		soldAt: {
			type: Date,
		},

		deletedAt: {
			type: Date,
		},

		constructedAt: {
			type: Date,
		},
	},
	{ timestamps: true, collection: 'gadgets' },
);
//*  compound index  shu 4 malumot birdaniga  Unique Bolish kk: xar 4talasi birxil bolgan malumotni  " 1-odam qoshaolmaydi " ruxsat bermasligimiz kk
GadgetSchema.index({ gadgetType: 1, gadgetLocation: 1, gadgetTitle: 1, gadgetPrice: 1 }, { unique: true });

export default GadgetSchema;
