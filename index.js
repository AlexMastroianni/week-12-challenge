// Depedancys
const mysql = require("mysql2");
const inquirer = require("inquirer");
const util = require("util");
const cTable = require("console.table");

// SQL connection to DB
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Abc12345!",
  database: "employee_DB",
});

// Querying DB and connection
connection.query = util.promisify(connection.query);
connection.connect(function (err) {
  if (err) throw err;
  init();
});

// very cool
console.table("\n-----------| EMPLOYEE TRACKER |------------\n");
// first question + defualt landing for user
const init = async () => {
  try {
    let answer = await inquirer.prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View Employees",
        "View Departments",
        "View Roles",
        "Add Employees",
        "Add Departments",
        "Add Roles",
        "Update Employee Role",
        "Exit",
      ],
    });
    // switch to change each user to answer to fucntion for using
    switch (answer.action) {
      case "View Employees":
        employeeView();
        break;

      case "View Departments":
        departmentView();
        break;

      case "View Roles":
        roleView();
        break;

      case "Add Employees":
        employeeAdd();
        break;

      case "Add Departments":
        departmentAdd();
        break;

      case "Add Roles":
        roleAdd();
        break;

      case "Update Employee Role":
        employeeUpdate();
        break;

      case "Exit":
        connection.end();
        break;
    }
  } catch (err) {
    console.log(err);
    init();
  }
};

// view eployess
const employeeView = async () => {
  console.log("Employee View");
  try {
    let query = "SELECT * FROM employee";
    connection.query(query, function (err, res) {
      if (err) throw err;
      let employeeArray = [];
      res.forEach((employee) => employeeArray.push(employee));
      console.table(employeeArray);
      init();
    });
  } catch (err) {
    console.log(err);
    init();
  }
};

// view deparment
const departmentView = async () => {
  console.log("Department View");
  try {
    let query = "SELECT * FROM departments";
    connection.query(query, function (err, res) {
      if (err) throw err;
      let departmentArray = [];
      res.forEach((department) => departmentArray.push(department));
      console.table(departmentArray);
      init();
    });
  } catch (err) {
    console.log(err);
    init();
  }
};
// Viewing roles
const roleView = async () => {
  console.log("Role View");
  try {
    let query = "SELECT * FROM role";
    connection.query(query, function (err, res) {
      if (err) throw err;
      let roleArray = [];
      res.forEach((role) => roleArray.push(role));
      console.table(roleArray);
      init();
    });
  } catch (err) {
    console.log(err);
    init();
  }
};
// Added roles
const roleAdd = async () => {
  try {
    console.log("Role Add");

    let departments = await connection.query("SELECT * FROM departments");

    let answer = await inquirer.prompt([
      {
        name: "title",
        type: "input",
        message: "What is the name of your new role?",
      },
      {
        name: "salary",
        type: "input",
        message: "What salary will this role provide?",
      },
      {
        name: "departmentId",
        type: "list",
        choices: departments.map((departmentId) => {
          return {
            name: departmentId.department_name,
            value: departmentId.id,
          };
        }),
        message: "What department ID is this role associated with?",
      },
    ]);
    // try figure out for each!!!!!!
    for (i = 0; i < departments.length; i++) {
      if (departments[i].department_id === answer.choice) {
        chosenDepartment = departments[i];
      }
    }
    let res = await connection.query("INSERT INTO role SET ?", {
      title: answer.title,
      salary: answer.salary,
      department_id: answer.departmentId,
    });

    console.log(`${answer.title} role added successfully.\n`);
    init();
  } catch (err) {
    console.log(err);
    init();
  }
};

const employeeAdd = async () => {
  try {
    console.log("Employee Add");

    let answer = await inquirer.prompt([
      {
        name: "firstName",
        type: "input",
        message: "What is the first name of this Employee?",
      },
      {
        name: "lastName",
        type: "input",
        message: "What is the last name of this Employee?",
      },
      {
        name: "employeeRoleId",
        type: "input",
        message: "What is this Employee's role id?",
      },
      {
        name: "employeeManagerId",
        type: "input",
        message: "What is this Employee's Manager's Id?",
      },
    ]);

    let res = await connection.query("INSERT INTO employee SET ?", {
      first_name: answer.firstName,
      last_name: answer.lastName,
      role_id: answer.employeeRoleId,
      manager_id: answer.employeeManagerId,
    });

    console.log(`${answer.firstName} ${answer.lastName} added successfully.\n`);
    init();
  } catch (err) {
    console.log(err);
    init();
  }
};
// add to deparments
const departmentAdd = async () => {
  try {
    console.log("Department Add");

    let answer = await inquirer.prompt([
      {
        name: "deptName",
        type: "input",
        message: "What is the name of your new department?",
      },
    ]);

    let res = await connection.query("INSERT INTO departments SET ?", {
      department_name: answer.deptName,
    });

    console.log(`${answer.deptName} added successfully to departments.\n`);
    init();
  } catch (err) {
    console.log(err);
    init();
  }
};

// Selection to update a roll for a specific employee.
const employeeUpdate = async () => {
  try {
    console.log("Employee Update");

    let employees = await connection.query("SELECT * FROM employee");

    let employeeSelection = await inquirer.prompt([
      {
        name: "employee",
        type: "list",
        choices: employees.map((employeeName) => {
          return {
            name: employeeName.first_name + " " + employeeName.last_name,
            value: employeeName.id,
          };
        }),
        message: "Please choose an employee to update.",
      },
    ]);

    let roles = await connection.query("SELECT * FROM role");

    let roleSelection = await inquirer.prompt([
      {
        name: "role",
        type: "list",
        choices: roles.map((roleName) => {
          return {
            name: roleName.title,
            value: roleName.id,
          };
        }),
        message: "Please select the role to update the employee with.",
      },
    ]);

    // fix
    let res = await connection.query("UPDATE employee SET ? WHERE ?", [
      { role_id: roleSelection.role },
      { id: employeeSelection.employee },
    ]);

    console.log(`The role was successfully updated.\n`);
    init();
  } catch (err) {
    console.log(err);
    init();
  }
};
