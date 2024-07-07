import { Hono } from 'hono';
import { getAllVideosFromChannel, getVideoById, getCommentsByVideoId, getRandomVideoFromChannel } from './util';

type AppContext = {
	Bindings: {
	  VIDEOS: KVNamespace;
	  API_KEY: string;
	}
  }

const app = new Hono<AppContext>().basePath('/api');

app.get('/', (c) => {
	return c.text('Hello Hono!');
});

app.get('/v1/videos', async (c) => {
	const videos = await getAllVideosFromChannel(c.env.VIDEOS, c.env.API_KEY);
	return c.json({ videos });
});

app.get('/v1/videos/', async (c) => {
	const videos = await getAllVideosFromChannel(c.env.VIDEOS, c.env.API_KEY);
	return c.json({ videos });
});

app.get('/v1/videos/random', async (c) => {
	const video = await getRandomVideoFromChannel(c.env.VIDEOS, c.env.API_KEY);
	return c.json({ video });
});

app.get('/v1/videos/:videoId', async (c) => {
	const videoId = c.req.param('videoId');
	const video = await getVideoById(videoId, c.env.API_KEY);
	return c.json({ video });
});

// 松岡修造公式Youtubeチャンネルでは基本的にCommentはオフになっている
app.get('/v1/videos/:videoId/comments', async (c) => {
	const videoId = c.req.param('videoId');
	const comments = await getCommentsByVideoId(videoId, c.env.API_KEY);
	return c.json({ comments });
});

export default app;