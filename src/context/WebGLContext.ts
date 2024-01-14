import {mat4} from "gl-matrix";

import {Point2D} from "../types/Point2D";
import {Context} from "../core/Context";
import {Polygon} from "../core/Polygon";
import {Camera} from "../core/Camera";
import {Model} from "../core/Model";
import {initBuffers} from "../utils/init-buffers";


type Mapped = {
    position: WebGLBuffer;
    color: WebGLBuffer;
    indices: WebGLBuffer;
};

export class WebGLContext extends Context {
    protected canvas: HTMLCanvasElement;
    protected context: WebGLRenderingContext;
    protected program: WebGLProgram;
    protected projectionMatrix;
    protected _buffers: Mapped;
    protected buffers: Mapped[] = [];
    public debug: boolean = false;

    public constructor() {
        super();

        this.canvas = document.createElement("canvas");

        const context = this.canvas.getContext("webgl");

        if(!context) {
            throw new Error();
        }

        this.context = context;
        this.program = this.initShaderProgram();
        this.context.linkProgram(this.program);

        this.initProjectionMatrix();
        // this.context.createBuffer();

        this._buffers = initBuffers(this.context);
    }

    public get domElement() {
        return this.canvas;
    }

    protected initShaderProgram() {
        return this.initShaderProgramV2();
    }

    protected initShaderProgramV1() {
        const vertexShader = this.loadShader(this.context.VERTEX_SHADER, `
            attribute vec3 coordinates; void main(void) {
                gl_Position = vec4(coordinates, 1.0);
            }
        `);
        const fragmentShader = this.loadShader(this.context.FRAGMENT_SHADER, `
            void main(void) {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 0.1);
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

    protected initShaderProgramV2() {
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

    protected initProjectionMatrix() {
        const fieldOfView = (this.fov * Math.PI) / 180; // in radians
        const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = -400.0;
        const projectionMatrix = mat4.create();

        // note: glmatrix.js always has the first argument
        // as the destination to receive the result.
        mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

        this.projectionMatrix = projectionMatrix;
    }

    protected initPositionBuffer() {
        const positionBuffer = this.context.createBuffer();

        const positions = [
            // Front face
            -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,

            // Back face
            -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,

            // Top face
            -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,

            // Bottom face
            -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

            // Right face
            1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,

            // Left face
            -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
        ];

        // Now pass the list of positions into WebGL to build the
        // shape. We do this by creating a Float32Array from the
        // JavaScript array, then use it to fill the current buffer.
        this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(positions), this.context.STATIC_DRAW);

        // console.log(positionBuffer);

        return positionBuffer;
    }

    protected initColorBuffer() {
        const faceColors = [
            [1.0, 1.0, 1.0, 1.0], // Front face: white
            [1.0, 0.0, 0.0, 1.0], // Back face: red
            [0.0, 1.0, 0.0, 1.0], // Top face: green
            [0.0, 0.0, 1.0, 1.0], // Bottom face: blue
            [1.0, 1.0, 0.0, 1.0], // Right face: yellow
            [1.0, 0.0, 1.0, 1.0], // Left face: purple
        ];

        // Convert the array of colors into a table for all the vertices.
        let colors: any[] = [];

        for(let j = 0; j < faceColors.length; ++j) {
            const c = faceColors[j];
            // Repeat each color four times for the four vertices of the face
            colors = colors.concat(c, c, c, c);
        }

        const colorBuffer = this.context.createBuffer();

        this.context.bindBuffer(this.context.ARRAY_BUFFER, colorBuffer);
        this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(colors), this.context.STATIC_DRAW);

        // console.log(colorBuffer);

        return colorBuffer;
    }

    protected initIndexBuffer() {
        const indexBuffer = this.context.createBuffer();
        this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER, indexBuffer);

        // This array defines each face as two triangles, using the
        // indices into the vertex array to specify each triangle's
        // position.

        const indices = [
            0, 1, 2, 0, 2, 3, // front
            4, 5, 6, 4, 6, 7, // back
            8, 9, 10, 8, 10, 11, // top
            12, 13, 14, 12, 14, 15, // bottom
            16, 17, 18, 16, 18, 19, // right
            20, 21, 22, 20, 22, 23, // left
        ];

        // Now send the element array to GL
        this.context.bufferData(this.context.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.context.STATIC_DRAW);

        return indexBuffer;
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
        this.initProjectionMatrix();
    }

    public setHeight(height: number) {
        super.setHeight(height);

        this.canvas.height = height;
        this.initProjectionMatrix();
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

    protected updateV1() {
        const fieldOfView = (45 * Math.PI) / 180; // in radians
        const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = mat4.create();

        // note: glmatrix.js always has the first argument
        // as the destination to receive the result.
        mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
        const modelViewMatrix = mat4.create();

        const cubeRotation = 0.0;

        // Now move the drawing position a bit to where we want to
        // start drawing the square.
        mat4.translate(
            modelViewMatrix, // destination matrix
            modelViewMatrix, // matrix to translate
            [-0.0, 0.0, -6.0]
        ); // amount to translate

        mat4.rotate(
            modelViewMatrix, // destination matrix
            modelViewMatrix, // matrix to rotate
            cubeRotation, // amount to rotate in radians
            [0, 0, 1]
        ); // axis to rotate around (Z)
        mat4.rotate(
            modelViewMatrix, // destination matrix
            modelViewMatrix, // matrix to rotate
            cubeRotation * 0.7, // amount to rotate in radians
            [0, 1, 0]
        ); // axis to rotate around (Y)
        mat4.rotate(
            modelViewMatrix, // destination matrix
            modelViewMatrix, // matrix to rotate
            cubeRotation * 0.3, // amount to rotate in radians
            [1, 0, 0]
        ); // axis to rotate around (X)

        if(this.debug) {
            console.log("projectionMatrix:", projectionMatrix);
        }

        const position = this.initPositionBuffer();

        if(this.debug) {
            console.log("position:", position);
        }

        this.context.bindBuffer(this.context.ARRAY_BUFFER, position);

        this.context.vertexAttribPointer(this.context.getAttribLocation(this.program, "aVertexPosition"), 3, this.context.FLOAT, false, 0, 0);
        this.context.enableVertexAttribArray(this.context.getAttribLocation(this.program, "aVertexPosition"));

        const color = this.initColorBuffer();

        if(this.debug) {
            console.log("color:", color);
        }

        this.context.bindBuffer(this.context.ARRAY_BUFFER, color);
        this.context.vertexAttribPointer(this.context.getAttribLocation(this.program, "aVertexColor"), 4, this.context.FLOAT, false, 0, 0);
        this.context.enableVertexAttribArray(this.context.getAttribLocation(this.program, "aVertexColor"));

        const indexes = this.initIndexBuffer();

        if(this.debug) {
            console.log("indexes:", indexes);
        }
        // Tell WebGL which indices to use to index the vertices
        this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER, indexes);

        this.context.useProgram(this.program);

        this.context.uniformMatrix4fv(this.context.getUniformLocation(this.program, "uProjectionMatrix"), false, projectionMatrix);
        this.context.uniformMatrix4fv(this.context.getUniformLocation(this.program, "uModelViewMatrix"), false, modelViewMatrix);

        {
            const vertexCount = 36;
            this.context.drawElements(this.context.TRIANGLES, vertexCount, this.context.UNSIGNED_SHORT, 0);
            this.context.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    protected updateV2() {
        const modelViewMatrix = mat4.create();

        const cubeRotation = 0.0;

        // Now move the drawing position a bit to where we want to
        // start drawing the square.
        mat4.translate(
            modelViewMatrix, // destination matrix
            modelViewMatrix, // matrix to translate
            [-0.0, 0.0, -6.0]
        ); // amount to translate

        mat4.rotate(
            modelViewMatrix, // destination matrix
            modelViewMatrix, // matrix to rotate
            cubeRotation, // amount to rotate in radians
            [0, 0, 1]
        ); // axis to rotate around (Z)
        mat4.rotate(
            modelViewMatrix, // destination matrix
            modelViewMatrix, // matrix to rotate
            cubeRotation * 0.7, // amount to rotate in radians
            [0, 1, 0]
        ); // axis to rotate around (Y)
        mat4.rotate(
            modelViewMatrix, // destination matrix
            modelViewMatrix, // matrix to rotate
            cubeRotation * 0.3, // amount to rotate in radians
            [1, 0, 0]
        ); // axis to rotate around (X)

        if(this.debug) {
            console.log("this.projectionMatrix:", this.projectionMatrix);
        }

        this.context.bindBuffer(this.context.ARRAY_BUFFER, this._buffers.position);
        this.context.vertexAttribPointer(this.context.getAttribLocation(this.program, "aVertexPosition"), 3, this.context.FLOAT, false, 0, 0);
        this.context.enableVertexAttribArray(this.context.getAttribLocation(this.program, "aVertexPosition"));

        this.context.bindBuffer(this.context.ARRAY_BUFFER, this._buffers.color);
        this.context.vertexAttribPointer(this.context.getAttribLocation(this.program, "aVertexColor"), 4, this.context.FLOAT, false, 0, 0);
        this.context.enableVertexAttribArray(this.context.getAttribLocation(this.program, "aVertexColor"));

        // Tell WebGL which indices to use to index the vertices
        this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER, this._buffers.indices);

        this.context.useProgram(this.program);

        this.context.uniformMatrix4fv(this.context.getUniformLocation(this.program, "uProjectionMatrix"), false, this.projectionMatrix);
        this.context.uniformMatrix4fv(this.context.getUniformLocation(this.program, "uModelViewMatrix"), false, this.getModelViewMatrix(0.0));

        {
            const vertexCount = 36;
            this.context.drawElements(this.context.TRIANGLES, vertexCount, this.context.UNSIGNED_SHORT, 0);
            this.context.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
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

    public setFov(fov: number) {
        super.setFov(fov);

        this.initProjectionMatrix();
    }

    public render(models: Model[], camera: Camera): void {
        this.initProjectionMatrix();
    }

    public renderPolygons(polygons: Polygon[], camera: Camera): void {
        for(const polygon of polygons) {
            this.drawPolygon(polygon, camera);
        }
    }

    public drawPolygon(polygon: Polygon, camera: Camera): void {
        const positionBuffer = this.context.createBuffer();

        const positions = polygon.points.map((point) => {
            return [point.x, point.y, point.z];
        }).flat();

        this.context.bindBuffer(this.context.ARRAY_BUFFER, positionBuffer);
        this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(positions), this.context.STATIC_DRAW)

        const colors = polygon.points.map(() => {
            return [1, 1, 1, 1];
        }).flat();

        const colorBuffer = this.context.createBuffer();

        this.context.bindBuffer(this.context.ARRAY_BUFFER, colorBuffer);
        this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(colors), this.context.STATIC_DRAW);

        const indexBuffer = this.context.createBuffer();

        const indices = Array.from({length: polygon.points.length}).map((_, index) => {
            return index;
        });

        this.context.bindBuffer(this.context.ARRAY_BUFFER, indexBuffer);
        this.context.bufferData(this.context.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.context.STATIC_DRAW);

        this.context.bindBuffer(this.context.ARRAY_BUFFER, positionBuffer);
        this.context.vertexAttribPointer(this.context.getAttribLocation(this.program, "aVertexPosition"), 3, this.context.FLOAT, false, 0, 0);
        this.context.enableVertexAttribArray(this.context.getAttribLocation(this.program, "aVertexPosition"));

        this.context.bindBuffer(this.context.ARRAY_BUFFER, colorBuffer);
        this.context.vertexAttribPointer(this.context.getAttribLocation(this.program, "aVertexColor"), 4, this.context.FLOAT, false, 0, 0);
        this.context.enableVertexAttribArray(this.context.getAttribLocation(this.program, "aVertexColor"));

        // Tell WebGL which indices to use to index the vertices
        this.context.bindBuffer(this.context.ARRAY_BUFFER, indexBuffer);

        this.context.useProgram(this.program);

        // Now move the drawing position a bit to where we want to
        // start drawing the square.

        this.context.uniformMatrix4fv(this.context.getUniformLocation(this.program, "uProjectionMatrix"), false, new Float32Array(camera.getProjectionMatrix().flat()));
        this.context.uniformMatrix4fv(this.context.getUniformLocation(this.program, "uModelViewMatrix"), false, this.getModelViewMatrix(0.0));

        // polygon.points.map((point) => {});

        // this.context.linkProgram(this.program);
        // this.context.useProgram(this.program);

        // const vertices = polygon.points.map(point => [point.x, point.y, point.z]).flat();
        // const buffer = this.context.createBuffer();
        // this.context.bindBuffer(this.context.ARRAY_BUFFER, buffer);
        // this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(vertices), this.context.STATIC_DRAW);
        // this.context.bindBuffer(this.context.ARRAY_BUFFER, null);

        // this.context.uniformMatrix4fv(this.context.getUniformLocation(this.program, "uProjectionMatrix"), false, this.projectionMatrix);

        // const modelViewMatrix = mat4.create();
        // mat4.rotate(modelViewMatrix, modelViewMatrix, 0, [0, 0, 1]);

        // this.context.uniformMatrix4fv(
        //     this.context.getUniformLocation(this.program, "uModelViewMatrix"),
        //     false,
        //     modelViewMatrix
        //     // new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -6, 1])
        // );
        //
        // const colorBuffer = this.context.createBuffer();
        // this.context.bindBuffer(this.context.ARRAY_BUFFER, colorBuffer);
        // this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(polygon.points.map(() => [1, 1, 1, 1]).flat()), this.context.STATIC_DRAW);
        // this.context.bindBuffer(this.context.ARRAY_BUFFER, null);
        // this.context.bindBuffer(this.context.ARRAY_BUFFER, colorBuffer);
        // this.context.vertexAttribPointer(this.context.getAttribLocation(this.program, "aVertexColor"), 4, this.context.FLOAT, false, 0, 0);
        // this.context.enableVertexAttribArray(this.context.getAttribLocation(this.program, "aVertexColor"));
        //
        // this.context.bindBuffer(this.context.ARRAY_BUFFER, buffer);
        // this.context.vertexAttribPointer(this.context.getAttribLocation(this.program, "aVertexPosition"), 3, this.context.FLOAT, false, 0, 0);
        // this.context.enableVertexAttribArray(this.context.getAttribLocation(this.program, "aVertexPosition"));
        //
        // this.context.drawArrays(this.context.TRIANGLE_FAN, 0, polygon.points.length);
        // this.context.drawElements(this.context.TRIANGLES, polygon.points.length, this.context.UNSIGNED_SHORT, 0);

        {
            const vertexCount = polygon.points.length;
            this.context.drawElements(this.context.TRIANGLES, vertexCount, this.context.UNSIGNED_SHORT, 0);
            this.context.viewport(0, 0, this.width, this.height);
        }
    }
}
