const CHANNEL_ID = 'UCix3CP_r1-t3GMymVnyskpw';
const MAX_RESULTS = 50;

// KVのキーを定義
const KV_KEY_VIDEOS = 'allVideos';

// YouTube API type definitions
interface YouTubeVideo {
    id: {
        videoId: string;
    };
    snippet: {
        title: string;
        description: string;
    };
}

interface YouTubeResponse {
    items: YouTubeVideo[];
    nextPageToken?: string;
}

interface YouTubeComment {
    id: string;
    snippet: {
        authorDisplayName: string;
        textDisplay: string;
        publishedAt: string;
        likeCount: number;
    };
}

interface YouTubeCommentResponse {
    items: YouTubeComment[];
    nextPageToken?: string;
}

export async function getAllVideosFromChannel(VIDEOS: KVNamespace, API_KEY: string): Promise<YouTubeVideo[]> {
        // まずKVからデータを取得
        let cachedVideos:YouTubeVideo[]|null = await VIDEOS.get(KV_KEY_VIDEOS, { type: 'json' });
        if (cachedVideos) {
            console.log('Returning cached videos');
            return cachedVideos;
        }

        // KVにデータがない場合はAPIからデータを取得
        let allVideos: YouTubeVideo[] = [];
        let nextPageToken:string = '';
        
        try {
            do {
                const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=${MAX_RESULTS}&pageToken=${nextPageToken}`;
                const response = await fetch(url);
                const data:YouTubeResponse = await response.json();
                
                if (data.items) {
                    allVideos = allVideos.concat(data.items);
                }
                
                nextPageToken = data.nextPageToken || '';
            } while (nextPageToken);
            // 取得したデータをKVに保存
            await VIDEOS.put(KV_KEY_VIDEOS, JSON.stringify(allVideos), { expirationTtl: 3600 }); // キャッシュの有効期限を1時間に設定
            console.log('Saved videos to KV');
        } catch (error) {
            console.error('Error fetching videos:', error);
        }
    
        return allVideos;
}

export async function getVideoById(videoId: string, API_KEY: string): Promise<YouTubeVideo | null> {
    try {
        const url = `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&id=${videoId}&part=snippet,statistics`;
        const response = await fetch(url);
        const data: YouTubeResponse = await response.json();

        if (data.items.length === 0) {
            return null;
        }

        return data.items[0];
    } catch (error) {
        console.error('Error fetching video details:', error);
        throw new Error('Failed to fetch video details');
    }
}

export async function getCommentsByVideoId(videoId: string, API_KEY: string): Promise<YouTubeComment[]> {
    let allComments: YouTubeComment[] = [];
    let nextPageToken:string = '';

    try {
        do {
            const url = `https://www.googleapis.com/youtube/v3/commentThreads?key=${API_KEY}&videoId=${videoId}&part=snippet&maxResults=${MAX_RESULTS}&pageToken=${nextPageToken}`;
            const response = await fetch(url);
            const data: YouTubeCommentResponse = await response.json();

            if (data.items) {
                allComments = allComments.concat(data.items);
            }

            nextPageToken = data.nextPageToken || '';
        } while (nextPageToken);

        return allComments;
    } catch (error) {
        console.error('Error fetching comments:', error);
        throw new Error('Failed to fetch comments');
    }
}

export async function getRandomVideoFromChannel(VIDEOS: KVNamespace, API_KEY: string): Promise<YouTubeVideo | null>{
    // KVからデータを取得
    const videos = await getAllVideosFromChannel(VIDEOS, API_KEY);

    if (videos && videos.length > 0) {
        // KVまたは取得したデータからランダムな動画を選択
        let randomIndex = Math.floor(Math.random() * videos.length);
        let video = videos[randomIndex];
        return video;
      } else {
        console.log('No videos found for this channel.');
        return null;
      }
}