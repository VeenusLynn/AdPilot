import Ad from "../models/ad.js";
import path from "path";
import fs from "fs";

export const createAd = async (req, res) => {
  try {
    const createdBy = req.user.userId;

    const { name, imageUrl, linkUrl, size, zipCodes, active } = req.body;

    if (!name || !size || !size.width || !size.height) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    const newAd = new Ad({
      name,
      imageUrl,
      linkUrl,
      size: {
        width: size.width,
        height: size.height,
      },
      zipCodes: zipCodes || [],
      active: active || false,
      createdBy,
    });

    const savedAd = await newAd.save();

    res.status(201).json({
      success: true,
      message: "Ad created successfully",
      ad: savedAd,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAds = async (req, res) => {
  try {
    const { active, zipCode, createdBy } = req.query;

    const filter = {};

    if (active !== undefined) {
      filter.active = active === "true";
    }

    if (zipCode) {
      filter.zipCodes = zipCode;
    }

    if (createdBy) {
      filter.createdBy = createdBy;
    }

    const ads = await Ad.find(filter).populate("createdBy", "email");

    res.status(200).json({
      success: true,
      count: ads.length,
      ads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch ads",
      error: error.message,
    });
  }
};

export const getAdById = async (req, res) => {
  try {
    const adId = req.params.id;

    const ad = await Ad.findById(adId).populate("createdBy", "email");

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    res.status(200).json({
      success: true,
      ad,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve ad",
      error: error.message,
    });
  }
};

export const updateAdById = async (req, res) => {
  try {
    const adId = req.params.id;
    const userId = req.user.userId;
    const updateData = req.body;

    const ad = await Ad.findById(adId);
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    if (ad.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this ad",
      });
    }

    if (updateData.size) {
      if (!updateData.size.width || !updateData.size.height) {
        return res.status(400).json({
          success: false,
          message: "Both width and height are required in size",
        });
      }
    }

    ad.name = updateData.name || ad.name;
    ad.imageUrl = updateData.imageUrl || ad.imageUrl;
    ad.linkUrl = updateData.linkUrl || ad.linkUrl;
    if (updateData.size) {
      ad.size.width = updateData.size.width;
      ad.size.height = updateData.size.height;
    }
    ad.zipCodes = updateData.zipCodes || ad.zipCodes;
    if (typeof updateData.active === "boolean") {
      ad.active = updateData.active;
    }

    const savedAd = await ad.save();

    res.status(200).json({
      success: true,
      message: "Ad updated successfully",
      ad: savedAd,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update ad",
      error: error.message,
    });
  }
};

export const deleteAdById = async (req, res) => {
  try {
    const adId = req.params.id;
    const userId = req.user.userId;

    const ad = await Ad.findById(adId);
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    if (ad.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this ad",
      });
    }

    await ad.deleteOne();

    res.status(200).json({
      success: true,
      message: "Ad deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete ad",
      error: error.message,
    });
  }
};

export const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  const imageUrl = `/uploads/${req.file.filename}`;

  res.status(200).json({
    success: true,
    message: "Image uploaded successfully",
    imageUrl,
  });
};
