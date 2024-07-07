# shuzo-api
[松岡修造公式Youtubeチャンネル](https://www.youtube.com/channel/UCix3CP_r1-t3GMymVnyskpw)の情報を取得するAPI。

## endpoints
https://shuzo-api.mtane0412.workers.dev/

- `GET /api/v1/videos`: 全動画の情報を返す。
- `GET /api/v1/videos/random`: ランダムな一つの動画の情報を返す。
- `GET /api/v1/videos/:videoId`: `videoId`の動画の情報を返す。
- `GET /api/v1/videos/:videoId/comments`: `videoId`の動画のコメント情報を返す。注) 松岡修造公式Youtubeチャンネルでは基本的にコメントを受け付けていない。