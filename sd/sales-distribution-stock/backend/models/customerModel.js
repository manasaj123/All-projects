const db = require("../config/db")

const Customer = {

getAll:(cb)=>{
db.query("SELECT * FROM customers",cb)
},

create:(data,cb)=>{
db.query("INSERT INTO customers SET ?",data,cb)
},

update:(id,data,cb)=>{
db.query("UPDATE customers SET ? WHERE customer_id=?",[data,id],cb)
},

delete:(id,cb)=>{
db.query("DELETE FROM customers WHERE customer_id=?",[id],cb)
}

}

module.exports = Customer
