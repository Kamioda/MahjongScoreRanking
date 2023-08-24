import React from 'react';
import { SetTitle } from './title.json';

/**
 * 
 * @param {number[]} Arr 
 * @returns 
 */
const CalcAverage = Arr => Arr.length === 0 ? 0 : Math.round(Arr.reduce((sum, i) => sum + i, 0) / Arr.length);

const GetRanking = async () => {
    return await fetch("./api/records")
        .then(response => response.json())
        .then(records => {
            
        });
}

const IndexItem = async props => {
    SetTitle(props.match.params.language, 'index');
    return await GetRanking().then(data => {
        
    });
};

export default IndexItem;
