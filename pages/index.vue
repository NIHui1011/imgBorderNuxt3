<template>
    <div class="min-w-[1000px] min-h-[700px] fixed inset-0 bg-gray-300 flex">
        <div class="w-[280px] bg-gray-400 text-white p-5 " v-if="displaySider">
            <h2 class=" ">辉辉边框</h2>

            <div class="my-3 line"></div>

            <div>
                <input class="bg-green-600 ring-1  hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    type="file" @change="onFilesChange"></input>
            </div>

            <div class="my-3 line"></div>

            <div>
                底栏颜色
                <el-color-picker v-model="barColor" @change="darwBorder()" />
            </div>

            <div class="my-3 line"></div>

            <div>
                第一行文本颜色
                <el-color-picker v-model="textColor" @change="darwBorder()" />
            </div>

            <div class="my-3 line"></div>

            <div>
                第二行文本颜色
                <el-color-picker v-model="textColor2" @change="darwBorder()" />
            </div>

            <div class="my-3 line"></div>

            <div>
                左文本
            </div>

            <div class="my-3 line"></div>

            <div>右文本</div>

            <div class="my-3 line"></div>

            <button class="border-0 bg-green-600 ring-1  hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                @click="outputClick">导出图片</button>

            <div class="my-3 line"></div>

            <div class="text-xs text-gray-200">Powered by 辉哩个辉</div>
        </div>
        <div class=" fixed left-4 rounded bottom-10 p-2 ring-1 bg-white text-rotate-90 cursor-pointer "
            @click="displaySider = !displaySider">{{ `${displaySider ? '隐藏' : '显示'}侧栏` }}</div>


        <div class="flex-1 flex items-center justify-center py-4 overflow-auto">
            <canvas canvas-id="canvasId" id="canvasId" class="bg-white" :width="canvasW" :height="canvasH"
                :style="{ transform: `scale(${scaleRatio})` }" />
        </div>



        <canvas canvas-id="offScreenCanvasId" id="offScreenCanvasId" style="display: none;" :width="offScreenCanvasW"
            :height="offScreenCanvasH" />


        <div class=" fixed right-10 bottom-10 bg-white shadow rounded ring-1 p-2 flex flex-col items-center ">
            <div class=" cursor-pointer" @click=" scaleRatio += 0.1">放大</div>
            <div class="my-2 line !bg-black/30"></div>
            <div>{{ scaleRatio?.toFixed(1) }}</div>
            <div class="my-2 line !bg-black/30"></div>
            <div class=" cursor-pointer" @click="scaleRatio -= 0.1">缩小</div>
        </div>

    </div>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs';
import { ElButton } from 'element-plus';
import ExifReader from 'exifreader';


const displaySider = ref(true);
const initW = 2000
const initH = 1500
const bottomBarH = ref(100)
const canvasW = ref<number>(initW);
const canvasH = ref<number>(initH + bottomBarH.value);
const offScreenCanvasW = ref<number>(initW);
const offScreenCanvasH = ref<number>(initH + bottomBarH.value);
const scaleRatio = ref(1 / 2.0)
const imgUrl = ref("")
const barColor = ref('#1E1E1EFF')
const textColor = ref('#FF8C00FF')
const textColor2 = ref('#EEEEED')

const myTakePhotoInfo = {
    LensModel: '镜头型号',
    Make: '相机品牌',
    Model: '相机型号',
    ExposureTime: '快门',
    FocalLength: '焦距',
    takePhotoInfo: '拍摄参数',
    time: '0000:00:00 00:00'
}

onMounted(() => {
    darwBorder()
})

const onFilesChange = async (e: any) => {
    console.log(e.target.files);

    if (e.target.files.length > 0) {
        const url = URL.createObjectURL(e.target.files[0]);
        imgUrl.value = url;
        console.log("url:", url);


        const img = new Image();
        img.src = url;
        const tags = await ExifReader.load(e.target.files[0]);
        console.log(tags);
        let takePhotoInfo = `${tags['FocalLengthIn35mmFilm']?.description}mm ${tags['FNumber']?.description} ${tags['ExposureTime']?.description} ISO${tags['ISOSpeedRatings']?.description}`
        myTakePhotoInfo.LensModel = tags['LensModel']?.description ?? '--'
        myTakePhotoInfo.Make = tags['Make']?.description ?? '--'
        myTakePhotoInfo.Model = tags['Model']?.description ?? '--'
        myTakePhotoInfo.ExposureTime = tags['LensModel']?.description ?? '--'
        myTakePhotoInfo.FocalLength = takePhotoInfo
        myTakePhotoInfo.time = tags['DateTime']?.description ?? '--'
        myTakePhotoInfo.takePhotoInfo = takePhotoInfo


        img.onload = function () {
            // 绘制图片到canvas上
            const imgRatio = img.width / img.height * 1.0;

            //  scaleRatio.value = initW / img.width;
            let newW = initW
            let newH = Math.floor(newW / imgRatio + bottomBarH.value)

            canvasW.value = newW
            canvasH.value = newH

            setTimeout(() => {
                drawUserImg(img);
                darwBorder()
            }, 100);

        };


    }
}

const darwBorder = (canvasId?: string) => {
    let cId = canvasId ?? "canvasId";
    const W = cId == 'canvasId' ? canvasW.value : offScreenCanvasW.value;
    const H = cId == 'canvasId' ? canvasH.value : offScreenCanvasH.value;
    const scale = 1


    const canvas = document.getElementById(cId) as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    console.log('draw border', cId, ':', W, ':', H)

    let offset = H - bottomBarH.value

    ctx.fillStyle = barColor.value
    ctx.fillRect(0, offset, W, H);


    const fontSize = 20 * scale
    const midTop = offset + (bottomBarH.value) / 2.0 - 4
    const midBottom = offset + (bottomBarH.value) / 2.0 + fontSize + 4
    const spaceH = 20

    // 绘制第一行文本
    ctx.fillStyle = textColor.value;
    ctx.font = `600 ${fontSize}px Arial`
    ctx.textAlign = 'left'
    ctx.fillText(`${myTakePhotoInfo.Make} ${myTakePhotoInfo.Model}`, spaceH, midTop)


    ctx.textAlign = 'right'
    ctx.fillText(myTakePhotoInfo.LensModel, W - spaceH, midTop)


    // 绘制第二行文本
    ctx.font = `300 ${fontSize - 2}px Arial`
    ctx.fillStyle = textColor2.value;

    ctx.textAlign = 'left'
    ctx.fillText("© 辉哩个辉 All Rights Reserved", spaceH, midBottom)
    ctx.textAlign = 'right'

    ctx.font = `light  ${fontSize - 2}px`
    ctx.fillText(myTakePhotoInfo.takePhotoInfo, W - spaceH, midBottom)


}

const drawUserImg = (img: CanvasImageSource) => {
    const canvas = document.getElementById("canvasId") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.drawImage(img, 0, 0, canvasW.value, canvasH.value - bottomBarH.value)
}

const drawOutputCanvas = () => {
    const offScreenCanvas = document.getElementById("offScreenCanvasId") as HTMLCanvasElement;
    const ctx = offScreenCanvas.getContext("2d")
    if (!ctx) return

    if (!imgUrl.value || imgUrl.value === "") {
        console.log('图片链接为空')
        return
    }

    const img = new Image();
    img.src = imgUrl.value;
    img.onload = function () {
        // 绘制图片到canvas上
        const imgRatio = img.width / img.height * 1.0;

        //  scaleRatio.value = initW / img.width;
        let newW = 0
        let newH = 0
        const maxBorderValue = 2400
        if (imgRatio < 1) {
            newW = (maxBorderValue * imgRatio)
            newH = (maxBorderValue + bottomBarH.value)
        } else {
            newW = maxBorderValue
            newH = Math.floor(newW / imgRatio + bottomBarH.value)
        }

        offScreenCanvasW.value = newW
        offScreenCanvasH.value = newH


        setTimeout(() => {
            // drawUserImg(img);
            ctx.drawImage(img, 0, 0, offScreenCanvasW.value, offScreenCanvasH.value - bottomBarH.value)
            darwBorder('offScreenCanvasId')

            output(offScreenCanvas)

        }, 100);

    }
}

const output = (canvasElement: HTMLCanvasElement) => {
    // 导出canvas内容为图片
    var image = canvasElement.toDataURL('image/png', 1);

    // 创建一个新的Image对象，并设置其src为canvas的数据URL
    var outimg = new Image(offScreenCanvasW.value, offScreenCanvasH.value);
    outimg.src = image;

    outimg.onload = () => {
        let link = document.createElement('a')
        link.setAttribute('download', 'output.png')
        link.setAttribute('href', outimg.src)
        link.click()
    };
}

const outputClick = () => {
    drawOutputCanvas()

    // const canvas = document.getElementById("canvasId") as HTMLCanvasElement;
    // const ctx = canvas.getContext("2d")
    // if (!ctx) return

    // // 导出canvas内容为图片
    // var image = canvas.toDataURL('image/png', 1);

    // // 创建一个新的Image对象，并设置其src为canvas的数据URL
    // var img = new Image(canvasW.value, canvasH.value);
    // img.src = image;

    // img.onload = () => {
    //     let link = document.createElement('a')
    //     link.setAttribute('download', 'output.png')
    //     link.setAttribute('href', img.src)
    //     link.click()
    // };
}


</script>

<style>
.line {
    width: 90%;
    height: 0.5px;
    background-color: rgba(255, 255, 255, 0.2);
}
</style>