const express = require('express');
const ClickEvent = require('../../../models/ClickEvent');

const router = express.Router();

function parseIds(body) {
  const raw = Array.isArray(body?.ids) ? body.ids : [];
  return raw.filter((id) => typeof id === 'string' && /^[a-f\d]{24}$/i.test(id));
}

/**
 * GET /api/v1/admin/clicks
 */
router.get('/', async (req, res, next) => {
  try {
    const clicksGrouped = await ClickEvent.aggregate([
      {
        $group: {
          _id: '$service',
          count: { $sum: 1 },
          lastClicked: { $max: '$createdAt' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const formatted = clicksGrouped.map((item) => ({
      service: item._id,
      count: item.count,
      lastClicked: item.lastClicked
    }));

    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Bulk delete handler for clicks
 */
async function handleBulkDeleteClicks(req, res, next) {
  try {
    const scope = req.body?.scope === 'all' ? 'all' : 'selected';

    if (scope === 'all') {
      const result = await ClickEvent.deleteMany({});
      return res.status(200).json({
        success: true,
        message: `All ${result.deletedCount} click record${result.deletedCount === 1 ? '' : 's'} deleted`,
        data: { scope: 'all', deleted: result.deletedCount }
      });
    }

    const requested = Array.isArray(req.body?.ids) ? req.body.ids : [];
    if (requested.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one click id, or set scope to "all"'
      });
    }

    const ids = parseIds(req.body);
    if (ids.length !== requested.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more ids are not valid Mongo ObjectIds'
      });
    }

    const result = await ClickEvent.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} click record${result.deletedCount === 1 ? '' : 's'} deleted`,
      data: { scope: 'selected', requested: ids.length, deleted: result.deletedCount }
    });
  } catch (error) {
    next(error);
  }
}

router.post('/bulk-delete', handleBulkDeleteClicks);
router.delete('/', handleBulkDeleteClicks);

module.exports = router;

