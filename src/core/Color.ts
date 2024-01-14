export class Color {
    public static parse(color: string) {
        return Color.parseRgb(color)
            || Color.parseHsl(color)
            || Color.parseHsla(color)
            || [1, 1, 1, 1];
    }

    public static parseRgb(color: string) {
        if(color[0] !== "#") {
            return null;
        }

        return [
            parseInt(color.slice(1, 3), 16) / 255,
            parseInt(color.slice(3, 5), 16) / 255,
            parseInt(color.slice(5, 7), 16) / 255,
            1
        ];
    }

    public static parseHsl(color: string) {
        const hslRegex = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/;
        const match = color.match(hslRegex);

        if(!match) {
            return null;
        }

        let hue = parseInt(match[1]) / 60;
        let saturation = parseInt(match[2]) / 100;
        let lightness = parseInt(match[3]) / 100;

        let c = (1 - Math.abs(2 * lightness - 1)) * saturation;
        let x = c * (1 - Math.abs(hue % 2 - 1));
        let m = lightness - c / 2;
        let r = 0,
            g = 0,
            b = 0;

        if(0 <= hue && hue < 1) {
            r = c;
            g = x;
            b = 0;
        }
        else if(1 <= hue && hue < 2) {
            r = x;
            g = c;
            b = 0;
        }
        else if(2 <= hue && hue < 3) {
            r = 0;
            g = c;
            b = x;
        }
        else if(3 <= hue && hue < 4) {
            r = 0;
            g = x;
            b = c;
        }
        else if(4 <= hue && hue < 5) {
            r = x;
            g = 0;
            b = c;
        }
        else if(5 <= hue && hue < 6) {
            r = c;
            g = 0;
            b = x;
        }

        return [r + m, g + m, b + m, 1];
    }

    public static parseHsla(color: string) {
        const hslaRegex = /hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/;
        const match = color.match(hslaRegex);

        if(!match) {
            return null;
        }

        let hue = parseInt(match[1]) / 60;
        let saturation = parseInt(match[2]) / 100;
        let lightness = parseInt(match[3]) / 100;
        let alpha = parseFloat(match[4]);

        let c = (1 - Math.abs(2 * lightness - 1)) * saturation;
        let x = c * (1 - Math.abs(hue % 2 - 1));
        let m = lightness - c / 2;
        let r = 0,
            g = 0,
            b = 0;

        if(0 <= hue && hue < 1) {
            r = c;
            g = x;
            b = 0;
        }
        else if(1 <= hue && hue < 2) {
            r = x;
            g = c;
            b = 0;
        }
        else if(2 <= hue && hue < 3) {
            r = 0;
            g = c;
            b = x;
        }
        else if(3 <= hue && hue < 4) {
            r = 0;
            g = x;
            b = c;
        }
        else if(4 <= hue && hue < 5) {
            r = x;
            g = 0;
            b = c;
        }
        else if(5 <= hue && hue < 6) {
            r = c;
            g = 0;
            b = x;
        }

        return [r + m, g + m, b + m, alpha];
    }
}
