const express = require("express")
const router = express.Router()

const {
getItemCategories,
createItemCategory,
updateItemCategory,
deleteItemCategory
} = require("../controllers/itemCategoryController")

router.get("/", getItemCategories)

router.post("/", createItemCategory)

router.put("/:id", updateItemCategory)

router.delete("/:id", deleteItemCategory)

module.exports = router
