
var data = {
    blocks: [
        {
            id: 'input',
            requestNodes: [
                { name: 'Nazwisko' },
                { name: 'Pesel' }
            ],
            responseNodes: [
                { name: 'Ref'},
                { name: 'Score' }
            ]
        },
        {
            id: 'calc1',
            requestNodes: [
                { name: 'Pesel' },
                { name: 'Imie' },
                { name: 'Nazwisko' }
            ],
            responseNodes: [
                { name: 'Ref'},
                { name: 'DataScoreIndex'},
                { name: 'Nationality'},
                { name: 'Score'}
            ]
        }
    ],
    maps: [
        {
            name: 'map-input-to-calc1',
            sourceBlockId: 'input',
            destinationBlockId: 'calc1',
            mapping: [
                { src: 'IN.Pesel', dst: 'IN.Pesel' },
                { src: 'IN.Nazwisko', dst: 'IN.Nazwisko' }
            ]
        }
    ]
}
var mapFlow = d3MapConnect.connectWith(document.querySelector('.chart-container'))
mapFlow.setData(data);
