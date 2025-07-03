const db = require('../services/db');
const config = require('../config');
const {
  ADDDRAGGABLEITEMSCHEMA,
  EDITDRAGGABLEITEMSCHEMA,
} = require('../schemas/draggables.schema');
require('dotenv').config();

const getSearchDraggableItems = async (req, res, next) => {
  let conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    // const isActive = req.query.active;
    // const categoryBeingSearched = req.query.innerItem;
    const search = req.query.term;

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
            a.isActive as draggable_isActive, a.region_category as region_category,
            b.name as draggable_category_name 
            FROM draggable_items a
            INNER JOIN draggable_categories b on b.id = a.draggable_category_id
            WHERE draggable_category_id=?`,
        [di.id],
      );
      draggableItems.push(itm);
    });

    await Promise.all(response);

    await conn.commit();

    const finalResults = draggableItems.flat();

    const items = finalResults?.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.draggable_category_name]: {
          id: curr.draggable_category_id,
          content: finalResults
            .filter((itm) => itm.draggable_category_id === curr.draggable_category_id)
            .map((d) => {
              return d.draggable_name.toLowerCase().includes(search.toLowerCase())
                ? {
                    itemId: d.draggable_item_id,
                    itemName: d.draggable_name,
                    draggableCategory: d.draggable_category_id,
                    regionCategory: d.region_category,
                    isActive: d.draggable_isActive,
                  }
                : null;
            })
            .filter((i) => i),
        },
      }),
      {},
    );

    res.status(200).json({
      items,
    });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
};

const getAllDraggableItems = async (req, res, next) => {
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
            a.isActive as draggable_isActive, a.region_category as region_category,
            b.name as draggable_category_name 
            FROM draggable_items a
            INNER JOIN draggable_categories b on b.id = a.draggable_category_id
            WHERE draggable_category_id=?`,
        [di.id],
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
                regionCategory: d.region_category,
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
            a.isActive as draggable_isActive, a.region_category as region_category,
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
                regionCategory: d.region_category,
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

const getAllInActiveDraggableItems = async (req, res, next) => {
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
            a.isActive as draggable_isActive, a.region_category as region_category,
            b.name as draggable_category_name 
            FROM draggable_items a
            INNER JOIN draggable_categories b on b.id = a.draggable_category_id
            WHERE draggable_category_id=? AND (a.isActive=? OR b.isActive=?)`,
        [di.id, 0, 0],
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
                regionCategory: d.region_category,
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
    const { value, error } =
      req.body.type === 'create'
        ? ADDDRAGGABLEITEMSCHEMA.validate(req.body)
        : EDITDRAGGABLEITEMSCHEMA.validate(req.body);

    if (error) {
      res.status(500).json({ error: config.messages.error });
      return false;
    }

    if (req.body.type === 'create') {
      const { draggable_category_id, name, isActive, regionCategory } = req.body;

      const [insertedDraggableItem] = await db.query(
        `
        INSERT INTO draggable_items(draggable_category_id, name, isActive, region_category) VALUES(?,?,?,?)
        `,
        [draggable_category_id, name, isActive, regionCategory],
      );

      res.status(200).json({ id: insertedDraggableItem?.insertId });
    } else {
      const { id, name, isActive, regionCategory } = req.body;

      await db.query(
        `
        UPDATE draggable_items SET name=?, isActive=?, region_category=?
        WHERE id=?
        `,
        [name, isActive, regionCategory, id],
      );

      res.status(200).json({ id });
    }
  } catch (error) {
    res.status(500).json({
      error,
    });
    next(error);
  }
};

module.exports = {
  getAllDraggableItems,
  getAllActiveDraggableItems,
  addEditDraggableItem,
  getAllInActiveDraggableItems,
  getSearchDraggableItems,
};
