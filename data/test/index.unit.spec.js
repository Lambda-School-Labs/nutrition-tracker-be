/*
 *********
 *
 * Database test file
 * ✓ Migrations: Make sure all expected tables are being created
 * ✓ Migrations: Make sure each table has the expected columns
 *
 *********
 */

const knex = require("../knex");

// This arr will hold all the tables & columns we expect to be made when we run knex migrate:latest
const tables = [
  ["users", ["id", "username", "password", "email", "height_cm", "sex", "dob"]],
  [
    "food_and_beverages",
    [
      "id",
      "name",
      "human_unit",
      "human_quantity",
      "standard_unit",
      "standard_quantity",
      "calories",
      "fat_g",
      "protein_g",
      "carbs_g",
      "sugar_g",
      "fiber_g",
      "sodium_mg"
    ]
  ],
  [
    "consumption_log",
    [
      "id",
      "user_id",
      "food_bev_id",
      "time_consumed_at",
      "human_quantity",
      "standard_quantity",
      "unit_type"
    ]
  ],
  [
    "recipes",
    [
      "id",
      "name",
      "description",
      "prep_time_min",
      "cook_time_min",
      "servings",
      "standard_quantity",
      "serving_description"
    ]
  ],
  [
    "recipe_instructions",
    ["id", "recipe_id", "step_number", "step_description"]
  ],
  [
    "recipe_ingredients",
    [
      "id",
      "recipe_id",
      "food_bev_id",

      "order",
      "human_quantity",
      "standard_quantity",
      "unit_type"
    ]
  ],
  [
    "recipes_consumption",
    ["id", "user_id", "recipe_id", "time_consumed_at", "recipe_proportion"]
  ],
  [
    "user_budget_data",
    [
      "id",
      "user_id",
      "start_date",
      "goal_weekly_weight_change_lb",
      "activity_level",
      "caloric_budget"
    ]
  ],
  ["user_metric_history", ["id", "user_id", "observation_time", "weight_kg"]]
];

// create a function to setup our migrations
const setup = async () => {
  try {
    await knex.migrate.latest();
  } catch (err) {
    console.log(err);
  }
};

// Trunc func in case we want to to test tables in isolation
const truncate = async () => {
  // return a concat'd string of all the tables in tables array at the top of this file
  const concatTables = [];
  for (const table in tables) {
    concatTables.push(table[0]);
  }
  const tablesToTrunc = tables.length > 1 ? concatTables.join() : tables[0][0];

  // run the raw sql command using the concat'd tables array
  await knex.raw("truncate table " + tablesToTrunc + " cascade");
};

// Rollback our migrations so we start fresh
const teardown = async () => {
  await knex.migrate.rollback();
};

// Before all of our tests are run, do dis
beforeAll(async () => {
  await teardown();
  //jest.setTimeout(5000);
  await setup();
});

// helper function to count columns of a table
const columnCount = async table => {
  const columnObject = await knex(table)
    .columnInfo()
    .then(columns => columns);
  return Object.keys(columnObject).length;
};

// If we need to, we can teardown after all tests but might not have to
// afterAll(async () => {
//   await teardown();
// });

// Jest's 'each' globals can accept a table of data! SICK!
describe.each`
  tableArray   | expected
  ${tables[0]} | ${true}
  ${tables[1]} | ${true}
  ${tables[2]} | ${true}
  ${tables[3]} | ${true}
  ${tables[4]} | ${true}
  ${tables[5]} | ${true}
  ${tables[6]} | ${true}
  ${tables[7]} | ${true}
  ${tables[8]} | ${true}
`(`Let's check out the table named $tableArray`, ({ tableArray, expected }) => {
  // We want to know if the current pg table we're looking at exists
  // We'll need this var in other functions, so init it in a higher scope : )
  let tableExists = [];

  // For the sake of being verbose, these vars should clarify what we're looking for
    let table = tableArray[0];
    let tableColumns = tableArray[1];
    
  // knex returns promises, so a lot of these tests would break without async/await
  test(`Returns ${expected} when we look for a table named ${
    table
  }`, async () => {
    expect(
      await knex.schema.hasTable(table).then(exists => {
        tableExists = exists;
        return exists;
      })
    ).toBe(expected);
  });

  test(`Does the table ${table} have ${tableColumns.length} columns?`, async () => {
    expect(
      await columnCount(table).then(count => {
        return count;
      })
    ).toBe(tableColumns.length);
  });

  test.each(tableColumns)(
    `Does the column '%s' in ${table} exist?`,
    async column => {
      expect(
        await knex.schema.hasColumn(table, column).then(hasColumn => {
          return hasColumn;
        })
      ).toBe(expected);
    }
  );
});