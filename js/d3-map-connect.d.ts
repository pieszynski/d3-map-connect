
declare namespace d3MapConnect {

    interface IMapVisualizer {
        setData(data: IFlowModel): void;
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
