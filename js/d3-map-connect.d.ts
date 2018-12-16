
declare namespace d3MapConnect {

    interface IMapVisualizer {
        setData(data: IFlowModel): void;
        showUnused(show: boolean): void;
        updateChartPos(): void;
        updateChartPos(pos: { x: number, y: number }): void;
        updateChartPos(x: number, y: number): void;
    }

    interface IFlowModel {
        blocks: Array<IBlock>;
        maps: Array<IMap>;
    }

    interface IBlock {
        id: string;
        requestNodes: Array<IBlockNode>;
        responseNodes: Array<IBlockNode>;
    }

    interface IBlockNode {
        name: string;
    }

    interface IMap {
        name: string;
        sourceBlockId: string;
        destinationBlockId: string;
        mapping: Array<IMapping>;
    }

    interface IMapping {
        src: string;
        dst: string;
    }

    interface IOptions {
        showUnused: boolean;
        nodeNameFn: (name: string) => string;
    }

    function connectWith(node: any, options?: IOptions): IMapVisualizer;
}
