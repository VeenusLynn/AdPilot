import mongoose from "mongoose";

const AdSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Ad name is required"],
      trim: true,
      maxlength: [100, "Ad name cannot exceed 100 characters"],
    },
    // imageUrl: {
    //   type: String,
    //   required: [true, "Image URL is required"],
    //   validate: {
    //     validator: function (v) {
    //       try {
    //         new URL(v);
    //         return true;
    //       } catch {
    //         return false;
    //       }
    //     },
    //     message: (props) => `${props.value} is not a valid URL!`,
    //   },
    // },
    // linkUrl: {
    //   type: String,
    //   required: [true, "Destination URL is required"],
    //   validate: {
    //     validator: function (v) {
    //       try {
    //         new URL(v);
    //         return true;
    //       } catch {
    //         return false;
    //       }
    //     },
    //     message: (props) => `${props.value} is not a valid URL!`,
    //   },
    // },
    size: {
      width: {
        type: Number,
        required: [true, "Width is required"],
        min: [1, "Width must be at least 1px"],
        max: [5000, "Width cannot exceed 5000px"],
      },
      height: {
        type: Number,
        required: [true, "Height is required"],
        min: [1, "Height must be at least 1px"],
        max: [5000, "Height cannot exceed 5000px"],
      },
    },
    zipCodes: {
      type: [String],
      validate: {
        validator: function (zips) {
          return zips.every((zip) => /^\d{5}(-\d{4})?$/.test(zip));
        },
        message: (props) => `${props.value} contains invalid ZIP codes!`,
      },
    },
    active: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator ID is required"],
    },
  },
  {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

AdSchema.index({ name: 1 });
AdSchema.index({ active: 1 });
AdSchema.index({ zipCodes: 1 });
AdSchema.index({ createdBy: 1 });

AdSchema.virtual("dimensions").get(function () {
  return `${this.size.width}x${this.size.height}`;
});

AdSchema.pre("save", async function (next) {
  try {
    const user = await mongoose.model("User").findById(this.createdBy);
    if (!user) {
      throw new Error("Creator user does not exist");
    }
    next();
  } catch (err) {
    next(err);
  }
});

const Ad = mongoose.model("Ad", AdSchema);
export default Ad;
