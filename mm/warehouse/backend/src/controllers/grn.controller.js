const Grn = require("../models/Grn");

exports.createGRN = async (req, res) => {
  try {
    const id = await Grn.create(req.body);
    res.status(201).json({ id });
  } catch (error) {
    console.error("CREATE GRN ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getPending = async (req, res) => {
  try {
    const [grns] = await Grn.findPending();
    res.json(grns);   
  } catch (error) {
    console.error("GET GRN ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};
