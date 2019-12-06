const db = require("../../data/knex.js");
// const moment = require("moment")

module.exports = {
  getServingsByFatsecretFoodId,
  insertFatsecretFoods
};

function getServingsByFatsecretFoodId(fatsecret_food_id) {
  const fatsecretCacheLimitHours = 22;
  // calculate current time, minus 22 hours -- to make sure we dont overlap with fatsecret's cache time length maximum of 24 hours.
  // 22h = 1000ms*60s*60min*22hrs = 79200000 = 79.2 million ms = 79.2*10**6
  const fatsecretCacheLimitMs = 1000 * 60 * 60 * fatsecretCacheLimitHours;
  const cacheCutoff = new Date(Date.now() - fatsecretCacheLimitMs);
  // use moment to calc 22 hours before now, to use pass to .where() clause

  return db("foods as f")
    .select("f.*")
    .where("f.fatsecret_food_id", fatsecret_food_id)
    .where("f.retrieved_at", ">", cacheCutoff);
}

function insertFatsecretFoods(foods) {
  console.log("foods being inserted", foods);
  return db("foods as f")
    .insert(foods)
    .returning("f.*");
}