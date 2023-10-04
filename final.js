const express = require("express");
const _ = require("lodash");
const axios = require("axios");
const API_URL = "https://intent-kit-16.hasura.app/api/rest/blogs";
const port = 3000;
const app = express();

app.get("/", async (req, res) => {
  res.send("Welcome to the Blogs API Functionality");
});

////////////////////////////////RETRIEVAL AND DATA ANALYSIS/////////////////////////////////////////

app.get("/api/blog-stats", async (req, res) => {
  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "x-hasura-admin-secret":
          "32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch data. Status: ${response.status}`);
    }
    const result = await response.json();
    const analysis = analyse(result);
    res.status(200).send(JSON.stringify(analysis));
  } catch (error) {
    res.status(404).send(error.message);
  }
});

const analyse = _.memoize(function analyse(data) {
  const numberOfBlogs = data.blogs.length;
  const longestTitleBlog = _.maxBy(data.blogs, (blog) => blog.title.length);
  const privacyBlogs = _.filter(data.blogs, (blog) =>
    _.includes(blog.title.toLowerCase(), "privacy")
  );
  const uniqueBlogTitles = _.uniq(_.map(data.blogs, "title"));
  return { numberOfBlogs, longestTitleBlog, privacyBlogs, uniqueBlogTitles };
});

////////////////////////////////RETRIEVAL AND DATA ANALYSIS/////////////////////////////////////////

//////////////////////////////////SEARCH FUNCTIONALITY//////////////////////////////////////////////

app.get("/api/blog-search", async (req, res) => {
  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "x-hasura-admin-secret":
          "32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data. Status: ${response.status}`);
    }

    const result = await response.json();
    const searchValue = req.query.query;
    if (searchValue) {
      const searchResult = searchBlogs(result, searchValue);
      if (searchResult.length > 0) {
        res.status(200).send(JSON.stringify(searchResult));
      } else {
        res.status(404).send("No Blogs found");
      }
    } else {
      res.status(200).send(JSON.stringify(result));
    }
  } catch (error) {
    res.status(404).send(error.message);
  }
});

function searchBlogs(data, searchValue) {
  const searchResult = _.filter(data.blogs, (blog) =>
    _.includes(blog.title.toLowerCase(), searchValue)
  );
  return searchResult;
}

//////////////////////////////////SEARCH FUNCTIONALITY//////////////////////////////////////////////

app.listen(port, (req, res) => {
  console.log(`listening on port ${port}...`);
});
