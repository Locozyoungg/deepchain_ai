// backend/serverless/deepchain-inference/ipfs.js
const ipfsClient = require('ipfs-http-client');

const ipfs = ipfsClient.create({
  url: process.env.IPFS_API_URL
});

async function getModelFromIPFS(cid) {
  const chunks = [];
  for await (const chunk of ipfs.cat(cid)) {
    chunks.push(chunk);
  }
  
  const modelData = Buffer.concat(chunks);
  return tf.loadLayersModel(
    tf.io.browserFiles([new File([modelData], 'model.json')])
  );
}

module.exports = { getModelFromIPFS };