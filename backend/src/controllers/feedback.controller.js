import * as feedbackService from '../services/feedback.service.js';
import { feedbackStatusSchema, submitFeedbackSchema } from '../validators/feedback.validator.js';
import { successResponse } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const submitFeedback = asyncHandler(async (req, res) => {
  const validatedData = submitFeedbackSchema.parse(req.body);
  const feedback = await feedbackService.createFeedback(req.user._id, validatedData);

  return successResponse(res, 201, 'Feedback submitted successfully.', { feedback });
});

export const getMyFeedback = asyncHandler(async (req, res) => {
  const result = await feedbackService.getUserFeedback(req.user._id, req.query);
  return successResponse(res, 200, 'Your feedback retrieved successfully.', result);
});

export const getAllFeedback = asyncHandler(async (req, res) => {
  const result = await feedbackService.getAllFeedback(req.query);
  return successResponse(res, 200, 'Feedback list retrieved successfully.', result);
});

export const updateFeedbackStatus = asyncHandler(async (req, res) => {
  const { status } = feedbackStatusSchema.parse(req.body);
  const feedback = await feedbackService.updateFeedbackStatus(req.params.id, status);

  return successResponse(res, 200, 'Feedback status updated successfully.', { feedback });
});
