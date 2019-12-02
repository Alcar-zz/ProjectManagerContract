pragma solidity ^0.5.8;

contract CommonUtilities {
    address payable owner;
    bool constant PREV = false;
    bool constant NEXT = true;

    constructor(address payable _addr) public {
        owner = _addr;
    }

    struct Addresses {
        mapping(address =>  mapping(bool => address)) addressIndexes;
    }

    function isOwner() internal view {
        require(msg.sender == owner, 'You aren\'t the owner of this contract');
    }

    function getAddressesString(Addresses storage addresses) internal view
    returns ( string memory projectAddresses) {
        address current = addresses.addressIndexes[address(0x0)][NEXT];
        string memory _addresses = _addressToString(current);
        current = addresses.addressIndexes[current][NEXT];
        while (current != address(0x0)) {
            _addresses = string(abi.encodePacked(_addresses, ',', _addressToString(current)));
            current = addresses.addressIndexes[current][NEXT];
        }
        return _addresses;
    }

    function _addressToString(address _addr) internal pure returns(string memory) {
        bytes32 value = bytes32(uint256(_addr));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint(uint8(value[i + 12] >> 4))];
            str[3+i*2] = alphabet[uint(uint8(value[i + 12] & 0x0f))];
        }
        return string(str);
    }

    function uintToString(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len - 1;
        j = _i;
        while (j != 0) {
            bstr[k--] = byte(uint8(48 + j % 10));
            j /= 10;
        }
        return string(bstr);
    }

    function removeElement(Addresses storage addresses, address _addr) internal  {
        // Stitch the neighbours together
        addresses.addressIndexes[addresses.addressIndexes[_addr][PREV]][NEXT] = addresses.addressIndexes[_addr][NEXT];
        addresses.addressIndexes[addresses.addressIndexes[_addr][NEXT]][PREV] = addresses.addressIndexes[_addr][PREV];
        // Delete state storage
        delete addresses.addressIndexes[_addr][PREV];
        delete addresses.addressIndexes[_addr][NEXT];
    }

    function addElement(Addresses storage addresses, address _addr) internal  {
        // Link the new node
        addresses.addressIndexes[_addr][PREV] = address(0x0);
        addresses.addressIndexes[_addr][NEXT] = addresses.addressIndexes[address(0x0)][NEXT];
        // Insert the new node
        addresses.addressIndexes[addresses.addressIndexes[address(0x0)][NEXT]][PREV] = _addr;
        addresses.addressIndexes[address(0x0)][NEXT] = _addr;
    }
}