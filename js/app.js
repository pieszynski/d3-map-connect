
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
                { name: 'Score' },
                { name: 'Imie' }
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
        },
        {
            id: 'calcFin',
            requestNodes: [
                { name: 'Ref'},
                { name: 'Pesel' },
                { name: 'Score' },
                { name: 'Nazwisko' },
                { name: 'Imie' }
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
                { src: 'IN.Nazwisko', dst: 'IN.Nazwisko' },
                { src: 'OUT.Imie', dst: 'IN.Imie' }
            ]
        },
        {
            name: 'map-calc1-calcFin',
            sourceBlockId: 'calc1',
            destinationBlockId: 'calcFin',
            mapping: [
                { src: 'OUT.Ref', dst: 'IN.Ref' },
                { src: 'IN.Pesel', dst: 'IN.Pesel' },
                { src: 'OUT.Score', dst: 'IN.Score' },
                { src: 'IN.Nazwisko', dst: 'IN.Nazwisko' }
            ]
        },
        {
            name: 'map-input-calcFin',
            sourceBlockId: 'input',
            destinationBlockId: 'calcFin',
            mapping: [
                { src: 'OUT.Imie', dst: 'IN.Imie' }
            ]
        }
    ]
}
var mapFlow = d3MapConnect.connectWith(
    document.querySelector('.chart-container'),
    { showUnused: true }
);
mapFlow.setData(data);

function updateShowUnused(evt) {
    mapFlow.showUnused(evt.checked)
}
