// backend/serverless/deepchain-inference/handler.js
const tf = require('@tensorflow/tfjs-node');
const { getModelFromIPFS } = require('./ipfs');

module.exports.handler = async (event) => {
  try {
    const { modelId, inputData } = JSON.parse(event.body);
    
    // 1. Load model from decentralized storage
    const model = await getModelFromIPFS(modelId);
    
    // 2. Preprocess input
    const inputTensor = tf.tensor(inputData);
    
    // 3. Run inference
    const output = model.predict(inputTensor);
    const results = Array.from(output.dataSync());
    
    return {
      statusCode: 200,
      body: JSON.stringify({ results })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};