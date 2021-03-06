import {GET, HttpContext} from "http-typescript";
import * as Fs from "fs";
import {FileUtils} from "../../tool/file.utils";
import {TestConf} from "../../docker-engine/conf/test.conf";
import {TestInfos} from "../../docker-engine/api/test.http.api";


export class TestHttp {

    private rootTestsDir = 'data/docker/tests';

    @GET('')
    public async getTests(): Promise<TestInfos[]> {




        let filesName: string[] = await Fs.promises.readdir(this.rootTestsDir);

        let filteredFileNames = filesName.filter(v => {
            return v.match(/.*\.json/);
        });

        let tests: TestInfos[] = [];
        for (let v of filteredFileNames) {
            let testInfos: TestInfos = await this.mapTestIdToTest(v.replace('.json', ''));
            if (testInfos != null) tests.push(testInfos);
        }

        return tests;
    }

    @GET('/:id')
    public async getTestById(context: HttpContext): Promise<TestInfos> {

        let id = context.params.id;
        console.log(`Recherche de la configuration pour le test : ${id}`);

        let testInfos: TestInfos = await this.mapTestIdToTest(id, true);

        return testInfos;
    }


    private async mapTestIdToTest(id: string, full = false): Promise<TestInfos> {
        let conf: TestConf;
        try {
            conf = await FileUtils.loadConf<TestConf>(`${this.rootTestsDir}/${id}.json`);
        } finally {
            if (!conf) return null;
        }

        let testInfos: TestInfos = {
            id: id,
            groupTitle: conf.groupTitle,
            title: conf.title,
            descriptif : conf.descriptif,
            codes: [],
            tests: []
        };

        if (!full) return testInfos;

        for (let f of conf.files) {
            for (let t of f.codes) {
                testInfos.codes.push({
                    title: t.title,
                    tag: t.tag,
                    template: await FileUtils.loadFile(`${this.rootTestsDir}/${testInfos.id}/${t.templateFile}`)
                });
            }
        }

        testInfos.tests = conf.tests.map(v => {
            return {
                param: JSON.stringify(v.param),
                result: JSON.stringify(v.result)
            }
        });

        return testInfos
    }
}