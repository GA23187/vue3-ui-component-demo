import { promises as fs } from 'fs'
import { dirname, resolve } from 'path'
import cpy from 'cpy'
import fg from 'fast-glob'
import less from 'less'
import { ES_DIR, LIB_DIR, SRC_DIR } from './tools'

export const bundleLess = async() => {
  // 将src下面的所有less文件按照原路径移动到es与lib文件加下
  await cpy(`${SRC_DIR}/**/*.less`, ES_DIR)
  await cpy(`${SRC_DIR}/**/*.less`, LIB_DIR)

  // 获取所有的index.less文件
  const lessFiles = await fg('**/index.less', {
    cwd: SRC_DIR,
    onlyFiles: true,
  })
  // less文件转css文件
  for (const lessFile of lessFiles) {
    const filePath = `${SRC_DIR}/${lessFile}`
    const lessContent = await fs.readFile(filePath, 'utf8')
    const code = await less.render(lessContent, {
      paths: [SRC_DIR, dirname(filePath)],
    })
    await fs.writeFile(resolve(ES_DIR, lessFile.replace('.less', '.css')), code.css)
    await fs.writeFile(resolve(LIB_DIR, lessFile.replace('.less', '.css')), code.css)
  }
}

bundleLess()
