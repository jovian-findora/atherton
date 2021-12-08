#!/bin/bash

REACT_UI_SRC="../react/src";

npm run compile;

rm -rf "${REACT_UI_SRC}/abi";
rm -rf "${REACT_UI_SRC}/typechain";

mkdir -p "${REACT_UI_SRC}/abi";
mkdir -p "${REACT_UI_SRC}/typechain";

cp -rT "build/contracts" "${REACT_UI_SRC}/abi/";
cp -rT "typechain" "${REACT_UI_SRC}/typechain/";
