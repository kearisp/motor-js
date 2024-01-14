import {mat4} from "gl-matrix";

import {Context} from "../core/Context";
import {Polygon} from "../core/Polygon";
import {Camera} from "../core/Camera";
import {Model} from "../core/Model";
import {Color} from "../core/Color";


export class WebGLContext extends Context {
    protected canvas: HTMLCanvasElement;
    protected context: WebGLRenderingContext;
    protected program: WebGLProgram;

    public constructor() {
        super();

        this.canvas = document.createElement("canvas");

        const context = this.canvas.getContext("webgl");

        if(!context) {
            throw new Error();
        }

        this.context = context;
        this.program = this.initShaderProgram();
    }

    public get domElement() {
        return this.canvas;
    }

    protected initShaderProgram() {
        const vertexShader = this.loadShader(this.context.VERTEX_SHADER, `
            attribute vec4 aVertexPosition;
            attribute vec4 aVertexColor;

            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;

            varying lowp vec4 vColor;

            void main(void) {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
                vColor = aVertexColor;
            }
        `);
        const fragmentShader = this.loadShader(this.context.FRAGMENT_SHADER, `
            varying lowp vec4 vColor;

            void main(void) {
                gl_FragColor = vColor;
            }
        `);

        const shaderProgram = this.context.createProgram();

        if(!shaderProgram) {
            throw new Error("Failed to create program");
        }

        this.context.attachShader(shaderProgram, vertexShader);
        this.context.attachShader(shaderProgram, fragmentShader);
        this.context.linkProgram(shaderProgram);

        if(!this.context.getProgramParameter(shaderProgram, this.context.LINK_STATUS)) {
            throw new Error("Failed to link program: " + this.context.getProgramInfoLog(shaderProgram));
        }

        return shaderProgram;
    }

    protected loadShader(type: WebGLRenderingContext["VERTEX_SHADER"] | WebGLRenderingContext["FRAGMENT_SHADER"], source: string) {
        const shader = this.context.createShader(type);

        if(!shader) {
            throw new Error("Failed to create shader");
        }

        this.context.shaderSource(shader, source);
        this.context.compileShader(shader);

        if(!this.context.getShaderParameter(shader, this.context.COMPILE_STATUS)) {
            throw new Error("Failed to compile shader: " + this.context.getShaderInfoLog(shader));
        }

        return shader;
    }

    public setWidth(width: number) {
        super.setWidth(width);

        this.canvas.width = width;
    }

    public setHeight(height: number) {
        super.setHeight(height);

        this.canvas.height = height;
    }

    public clear(): void {
        this.context.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
        this.context.clearDepth(1.0); // Clear everything
        this.context.enable(this.context.DEPTH_TEST); // Enable depth testing
        this.context.depthFunc(this.context.LEQUAL); // Near things obscure far things

        // Clear the canvas before we start drawing on it.
        this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);

        // this.updateV2();
    }

    protected getModelViewMatrix(angle: number) {
        const modelViewMatrix = mat4.create();

        mat4.translate(
            modelViewMatrix, // destination matrix
            modelViewMatrix, // matrix to translate
            [-0.0, 0.0, -6.0]
        ); // amount to translate

        mat4.rotate(
            modelViewMatrix, // destination matrix
            modelViewMatrix, // matrix to rotate
            angle, // amount to rotate in radians
            [0, 0, 1]
        ); // axis to rotate around (Z)

        mat4.rotate(
            modelViewMatrix, // destination matrix
            modelViewMatrix, // matrix to rotate
            angle * 0.7, // amount to rotate in radians
            [0, 1, 0]
        ); // axis to rotate around (Y)
        mat4.rotate(
            modelViewMatrix, // destination matrix
            modelViewMatrix, // matrix to rotate
            angle * 0.3, // amount to rotate in radians
            [1, 0, 0]
        ); // axis to rotate around (X)

        return modelViewMatrix;
    }

    public render(models: Model[], camera: Camera): void {
        //
    }

    public renderPolygons(polygons: Polygon[], camera: Camera): void {
        for(const polygon of polygons) {
            polygon.triangulate(this.debug).forEach((polygon) => {
                this.drawPolygon(polygon, camera);
            });
        }
    }

    public drawPolygon(polygon: Polygon, camera: Camera): void {
        const positionBuffer = this.context.createBuffer();

        const positions = polygon.points.map((point) => {
            return [point.x, point.y, point.z];
        }).flat();

        this.context.bindBuffer(this.context.ARRAY_BUFFER, positionBuffer);
        this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(positions), this.context.STATIC_DRAW)

        const color = Color.parse(polygon.color || "");

        if(this.debug) {
            console.log(polygon.color, color);
        }

        const colors = polygon.points.map(() => {
            return color;
        }).flat();

        const colorBuffer = this.context.createBuffer();

        this.context.bindBuffer(this.context.ARRAY_BUFFER, colorBuffer);
        this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(colors), this.context.STATIC_DRAW);

        const indexBuffer = this.context.createBuffer();

        const indices = Array.from({length: polygon.points.length}).map((_, index) => {
            return index;
        });

        this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER, indexBuffer);
        this.context.bufferData(this.context.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.context.STATIC_DRAW);

        this.context.bindBuffer(this.context.ARRAY_BUFFER, positionBuffer);
        this.context.vertexAttribPointer(this.context.getAttribLocation(this.program, "aVertexPosition"), 3, this.context.FLOAT, false, 0, 0);
        this.context.enableVertexAttribArray(this.context.getAttribLocation(this.program, "aVertexPosition"));

        this.context.bindBuffer(this.context.ARRAY_BUFFER, colorBuffer);
        this.context.vertexAttribPointer(this.context.getAttribLocation(this.program, "aVertexColor"), 4, this.context.FLOAT, false, 0, 0);
        this.context.enableVertexAttribArray(this.context.getAttribLocation(this.program, "aVertexColor"));

        this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER, indexBuffer);

        this.context.useProgram(this.program);

        this.context.uniformMatrix4fv(this.context.getUniformLocation(this.program, "uProjectionMatrix"), false, new Float32Array(camera.getProjectionMatrix().flat()));
        this.context.uniformMatrix4fv(this.context.getUniformLocation(this.program, "uModelViewMatrix"), false, this.getModelViewMatrix(0.0));

        {
            const vertexCount = polygon.points.length;
            this.context.drawElements(this.context.TRIANGLES, vertexCount, this.context.UNSIGNED_SHORT, 0);
            this.context.viewport(0, 0, this.width, this.height);
        }
    }
}
