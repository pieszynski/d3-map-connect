
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
        
    }

    interface IBlock {
        id: string;
        requestNodes: Array<IBlockNode>;
        responseNodes: Array<IBlockNode>;
    }

    interface IBlockNode {
        name: string;
    }

    function connectWith(node: any): IMapVisualizer;
}
