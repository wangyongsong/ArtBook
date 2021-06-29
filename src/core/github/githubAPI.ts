import { message } from 'antd';
import { RcFile } from 'antd/lib/upload';
import fs from 'fs-extra';
import moment from 'moment';
import db from '../../db';
import { apiMessage, imgUrlToBase64 } from '../../utils/commonUtils';
import request from './githubAxios';

/**
 * @description: 更新文件
 */
export function githubPutFileAPI(params: {
  originFileObj: RcFile;
  uploadTime: string;
}) {
  const { originFileObj, uploadTime } = params;
  const { userName, repository, storagePath = '', accessToken } =
    db.get('accountSetting.github') || {};
  const timestamp = new Date().getTime();
  const fileName = `${moment(timestamp).valueOf()}-${originFileObj.name}`;

  return request({
    method: 'PUT',
    url: `/repos/${userName}/${repository}/contents/${storagePath}${fileName}`,
    headers: { Authorization: `token ${accessToken}` },
    data: {
      message: apiMessage(uploadTime),
      content: Buffer.from(fs.readFileSync(originFileObj.path)).toString(
        'base64'
      ),
    },
  });
}

/**
 * @description: 删除文件
 */
export async function githubDeleteFile(params: {
  item: any;
  deleteTime: string;
}) {
  const {
    item: { path, sha },
    deleteTime,
  } = params;
  const { userName, repository, accessToken } =
    db.get('accountSetting.github') || {};
  return request({
    method: 'DELETE',
    url: `/repos/${userName}/${repository}/contents/${path}`,
    data: {
      sha,
      message: apiMessage(deleteTime, 'delete'),
    },
    headers: { Authorization: `token ${accessToken}` },
  });
}
