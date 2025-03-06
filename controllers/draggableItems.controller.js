const db = require('../services/db');
const config = require('../config');
const { ADDDRAGGABLEITEMSCHEMA } = require('../schemas/draggables.schema');
require('dotenv').config();

const getAllActiveDraggableItems = async (req, res, next) => {
  let conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [draggableCategories] = await db.query(
      `
        SELECT *
        FROM draggable_categories
        WHERE isActive=?    
    `,
      [1],
    );

    let draggableItems = [];
    const response = draggableCategories?.map(async (di) => {
      const [itm] = await conn.query(
        `SELECT 
            a.id as draggable_item_id, 
            a.draggable_category_id as draggable_category_id,
            a.name as draggable_name,
            a.isActive as draggable_isActive,
            b.name as draggable_category_name 
            FROM draggable_items a
            INNER JOIN draggable_categories b on b.id = a.draggable_category_id
            WHERE draggable_category_id=? AND a.isActive=? AND b.isActive=?`,
        [di.id, 1, 1],
      );
      draggableItems.push(itm);
    });

    await Promise.all(response);

    await conn.commit();

    const finalResults = draggableItems.flat();

    res.status(200).json({
      items: finalResults?.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.draggable_category_name]: {
            id: curr.draggable_category_id,
            content: finalResults
              .filter((itm) => itm.draggable_category_id === curr.draggable_category_id)
              .map((d) => ({
                itemId: d.draggable_item_id,
                itemName: d.draggable_name,
                draggableCategory: d.draggable_category_id,
                isActive: d.draggable_isActive,
              })),
          },
        }),
        {},
      ),
    });
  } catch (error) {
    await conn.rollback();
    res.status(401).json({
      error,
    });
    next(error);
  } finally {
    conn.release();
  }
};

const addEditDraggableItem = async (req, res, next) => {
  try {
    const typeOfAction = req.type === 'create' ? 1 : 0;
    const { value, error } = typeOfAction
      ? ADDDRAGGABLEITEMSCHEMA.validate(req.body)
      : ADDDRAGGABLEITEMSCHEMA.validate(req.body);

    if (error) {
      res.status(500).json({ error: config.messages.error });
      return false;
    }

    const { draggable_category_id, name, isActive } = req.body;

    await db.query(
      `
      INSERT INTO draggable_items(draggable_category_id, name, isActive) VALUES(?,?,?)
      `,
      [draggable_category_id, name, isActive],
    );

    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({
      error,
    });
    next(error);
  }
};

module.exports = { getAllActiveDraggableItems, addEditDraggableItem };
