import {ImageConf} from "../conf/image.conf";

export class ImageBean {

    public dirPath: string;
    public name: string;
    public conf: ImageConf;

    public get fullName() {
        return `${this.name}:${this.conf.version}`;
    }
}


