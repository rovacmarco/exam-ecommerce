let secureApi = (req, res, next) => {
  let apiHeader = req.headers.authorization;

  if (apiHeader && apiHeader === "Aa@4444444") {
    next();
  } else {
    return res.status(401).json({ 
      error: "Unauthorized access! Invalid or missing API key." 
    });
  }
};

module.exports = secureApi;