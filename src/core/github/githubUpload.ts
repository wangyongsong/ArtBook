/* eslint-disable class-methods-use-this */
import { Modal } from 'antd';
import { RcFile } from 'antd/lib/upload/interface';
import moment from 'moment';
import db from '../../db';
import { githubDeleteFile, githubPutFileAPI } from './githubAPI';

const USEACCOUNT_GITHUB = 'github';
const IMAGES = 'images';

class GithubUpload {
  file: any;

  formData: any;

  imageReload: any;

  getUploadFile(file: RcFile, formData: any) {
    this.file = file;
    if (!file) return;
    this.putGithubFile(file, formData);
  }

  async putGithubFile(originFileObj: RcFile, formData: { tagId: any }) {
    const uploadTime = moment().format('YYYY-MM-DD hh:mm:ss');
    await githubPutFileAPI({ originFileObj, uploadTime })
      .then((res: any) => {
        const {
          status,
          data: { content },
        } = res;
        if (status === 201) {
          db.insert(IMAGES, {
            tagId: formData.tagId,
            useAccount: USEACCOUNT_GITHUB,
            sha: content.sha,
            path: content.path,
            src: content.download_url,
            createdTime: uploadTime,
          });
          this.imageReload();
          this.insertUploadImagesLog(
            '上传成功',
            `${originFileObj.name} ${uploadTime}`,
            true
          );
        }
        return res;
      })
      .catch((err) => {
        const {
          response: {
            data: { message: msg },
            status,
            config,
          },
        } = err;
        const errorMsg = `(${status} ${msg})(${config.url})`;
        this.insertUploadImagesLog(
          '上传失败',
          `${originFileObj.name} ${uploadTime} ${errorMsg}`,
          false
        );
      });
  }

  async deleteGithubFile(item: any) {
    const deleteTime = moment().format('YYYY-MM-DD hh:mm:ss');
    const { path, sha } = item;
    const { imageReload, insertUploadImagesLog } = this;

    if (!path || !sha) {
      Modal.confirm({
        title: '缺少删除远程文件的参数',
        content: '确定删除文件吗？如果确定，将只会删除本地记录',
        onOk() {
          db.removeById('images', item.id);
          imageReload();
          insertUploadImagesLog(
            '删除本地图片成功',
            `${item.path} ${deleteTime}`,
            true
          );
        },
      });
      return;
    }
    await githubDeleteFile({ item, deleteTime })
      .then((res) => {
        if (res.status === 200) {
          db.removeById(IMAGES, item.id);
          this.imageReload();
          this.insertUploadImagesLog(
            '删除成功',
            `${item.path} ${deleteTime}`,
            true
          );
        }
        return res;
      })
      .catch((err) => {
        const {
          response: {
            data: { message: msg },
            status,
            config,
          },
        } = err;
        const errorMsg = `(${status} ${msg})(${config.url})`;
        this.insertUploadImagesLog(
          '删除失败',
          `${item.path} ${deleteTime} ${errorMsg}`,
          false
        );
      });
  }

  reload(fn: any) {
    this.imageReload = fn;
  }

  insertUploadImagesLog(title: string, description: string, success: boolean) {
    db.insert('uploadImagesLog', {
      title,
      success,
      description,
      read: false,
    });
  }
}

export default new GithubUpload();
