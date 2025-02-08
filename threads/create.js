import OpenAI from 'openai';
const openai = new OpenAI();

async function createId(req, res) {
    const thread = await openai.beta.threads.create();

    const message = await openai.beta.threads.messages.create(
      thread.id,
      {
        role: 'assistant',
        content: 'Please first ask the user for their name, and address them as such.'
      }
    );

    res.json({ thread: thread.id })
}

export default createId