const catchAsync = require('../utils/catchAsync');
const { success } = require('../utils/apiResponse');
const competitionService = require('../services/competitionService');

const listCompetitions = catchAsync(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
  const data = await competitionService.listPublishedCompetitions({ page, limit });
  success(res, 200, data.items, { page: data.page, limit: data.limit, total: data.total, totalPages: data.totalPages });
});

// Optional auth (attachUserIfPresent): works for anonymous visitors, and
// additionally returns per-user state (registered? submitted? CTA?) when a
// valid token is supplied.
const getCompetition = catchAsync(async (req, res) => {
  const data = await competitionService.getCompetitionDetails({ idOrSlug: req.params.idOrSlug, user: req.user || null });
  success(res, 200, data);
});

module.exports = { listCompetitions, getCompetition };
