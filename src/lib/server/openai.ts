import {
	OPENAI_API_KEY
} from '$env/static/private';
import axios from 'axios';

const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${OPENAI_API_KEY}`,
    'OpenAI-Beta': 'assistants=v2'
}

export const createMessage = async (thread_id, message) => {
    try {
        const response = await axios.post(
          `https://api.openai.com/v1/threads/${thread_id}/messages`,
          {
            "role": "user",
            "content": message
          },
          { headers }
        );
    
        return response.data
        // Print the response from the API
        // console.log('Response:', response.data.choices[0].message.content);
      } catch (error) {
        console.error('Error calling createMessage OpenAI API:', error.response ? error.response.data : error.message);
        throw error;
      }
}

export const createRun = async (assistant_id, thread_id) => {
    try {
        const response = await axios.post(
          `https://api.openai.com/v1/threads/${thread_id}/runs`,
          {
            // "assistant_id": "asst_msUzNiz4RlNzdj0tFcnIgZLs"
            "assistant_id": assistant_id
          },
          { headers }
        );
    
        return response.data
        // Print the response from the API
        // console.log('Response:', response.data.choices[0].message.content);
      } catch (error) {
        console.error('Error calling createRun OpenAI API:', error.response ? error.response.data : error.message);
        throw error;
      }
}

export const retrieveRun = async (thread_id, run_id) => {
    try {
        const response = await axios.get(
          `https://api.openai.com/v1/threads/${thread_id}/runs/${run_id}`,
          { headers }
        );
    
        return response.data
        // Print the response from the API
        // console.log('Response:', response.data.choices[0].message.content);
      } catch (error) {
        console.error('Error calling listMessages OpenAI API:', error.response ? error.response.data : error.message);
        throw error;
      }
}

const pollRun = async (thread_id, run_id, attempt = 1) => {
    try {
        if (attempt > 10) {
            throw new Error(`Failed to retrieve run after ${attempt} attempts`)
        }
        const res = await retrieveRun(thread_id, run_id)
        if (res && res.status && res.status === "completed") {
            return res
        }
        await new Promise((res) => {
            setTimeout(() => {
                res(true)
            }, 1000)
        })
        return pollRun(thread_id, run_id, ++attempt)
    } catch (error) {
        console.error('pollRun error', error)
        throw error;
    }
}

export async function pollRunWithTimeout(thread_id, run_id) {
    try {
      const result = await Promise.race([
        pollRun(thread_id, run_id),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Operation timed out ')), 10000);
        })
      ]);
      return result;
    } catch (error) {
      console.error(error.message);
      return null;
    }
  }


export const createThread = async () => {
    try {
        const response = await axios.post(
          'https://api.openai.com/v1/threads',
          null,
          { headers }
        );
    
        return response.data
        // Print the response from the API
        // console.log('Response:', response.data.choices[0].message.content);
      } catch (error) {
        console.error('Error calling createThread OpenAI API:', error.response ? error.response.data : error.message);
        throw error;
      }
}

export const listMessages = async (thread_id) => {
    try {
        const response = await axios.get(
          `https://api.openai.com/v1/threads/${thread_id}/messages`,
          { headers }
        );
    
        return response.data
        // Print the response from the API
        // console.log('Response:', response.data.choices[0].message.content);
      } catch (error) {
        console.error('Error calling listMessages OpenAI API:', error.response ? error.response.data : error.message);
        throw error;
      }
}