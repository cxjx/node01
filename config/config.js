
const URL_TABLE_NAME = 'url2';
const IMAGE_TABLE_NAME = 'image2';
const URL_NUM_PER_TASK = 10;
const TASK_CONCURRENCY = 10;
const retryOpt = {times: 5, interval: 200};
// retryOpt = {
//   times: 5,
//   interval: function(retryCount) {
//     return 50 * Math.pow(2, retryCount);
//   }
// };
const asyncParalelLimit = 5;

const URL_TABLE_FIELDS = [
  '"id" SERIAL PRIMARY KEY',
  '"provider_id" varchar(64) NOT NULL',
  '"provider_status" varchar(32) NOT NULL',
  '"shoottype" varchar(32) NOT NULL',
  '"url" varchar(512) UNIQUE NOT NULL',
];
const IMAGE_TABLE_FIELDS = [
  '"id" SERIAL PRIMARY KEY',
  '"url_id" int REFERENCES "'+URL_TABLE_NAME+'"("id") UNIQUE NOT NULL',
  '"motion_blur" real',
  '"light" real',
  '"color_harmony" real',
  '"symmetry" real',
  '"vivid_color" real',
  '"repetition" real',
  '"content" real',
  '"do_f" real',
  '"object" real',
  '"rule_of_thirds" real',
  '"balancing_element" real',
  '"score" real',
];

function gen_create_table_sql(table_name, table_fields) {
  var fields = table_fields.join(',');
  return `CREATE TABLE IF NOT EXISTS "${table_name}" (${fields})`;
}
function gen_insert_sql(table_name, conflict_field) {
  // if(table_name == URL_TABLE_NAME){
  //   return 'insert into '+table_name+'(${this:name}) values(${this:csv}) on conflict('+conflict_field+') do nothing RETURNING *';
  // }else{
    return 'insert into '+table_name+'(${this:name}) values(${this:csv}) on conflict('+conflict_field+') do nothing';
  // }
}
function gen_select_sql(table_name){
  return `select * from ${table_name}`;
}

module.exports = {
  OK: 'success',
  NOK: 'failed',
  EMPTY: 'isEmptyArray',
  urlPerTask: URL_NUM_PER_TASK,
  taskConcurrency: TASK_CONCURRENCY,
  asyncParalelLimit: asyncParalelLimit,
  retryOpt: retryOpt,
  analysisAPI: 'http://35.202.251.156:1080/evaluation',
  // database connection:
  dbConnection: 'postgresql://postgres:root123@localhost:5432/test',
  URL_TABLE_NAME: URL_TABLE_NAME,
  IMAGE_TABLE_NAME: IMAGE_TABLE_NAME,
  SQL_CREATE_TABLE_DOMAIN: gen_create_table_sql(URL_TABLE_NAME, URL_TABLE_FIELDS),
  SQL_CREATE_TABLE_ANALYSIS: gen_create_table_sql(IMAGE_TABLE_NAME, IMAGE_TABLE_FIELDS),
  SQL_SELECT_FROM_DOMAIN: gen_select_sql(URL_TABLE_NAME),
  SQL_INSERT_INTO_DOMAIN: gen_insert_sql(URL_TABLE_NAME, 'url'),
  SQL_INSERT_INTO_ANALYSIS: gen_insert_sql(IMAGE_TABLE_NAME, 'url_id'),
}
