import { Fragment, useRef, useState } from 'react'
import { Popover } from '@headlessui/react'


const RateInfoPopover = ({ rate, walletBalance, bankBalance, totalSupply, calculatedRate }) => {
    return (
        <Popover className="relative">
            <Popover.Button>
                <span className='pl-2 text-sm font-bold'>= {rate} RISC</span>
            </Popover.Button>

            <Popover.Panel className="absolute z-10 bg-white rounded-md border-2 border-stone-500 p-2">
                <div className="flex flex-col">
                    <div className='flex'>
                        <span className='mr-2 w-2'>+</span>
                        <span className='mr-2 w-32'>wallet balance</span>
                        <span>{walletBalance}</span>
                    </div>
                    <div className='flex'>
                        <span className='mr-2 w-2'>+</span>
                        <span className='mr-2 w-32'>bank balance</span>
                        <span>{bankBalance}</span>
                    </div>
                    <div className='flex'>
                        <span className='mr-2 w-2'>/</span>
                        <span className='mr-2 w-32'>total coin supply</span>
                        <span>{totalSupply}</span>
                    </div>
                    <div className='flex font-semibold'>
                        <span className='mr-2'>=</span>
                        <span className='mr-2 w-32'>rate</span>
                        <span className=''>{calculatedRate}</span>
                    </div>
                </div>

                <img src="/solutions.jpg" alt="" />
            </Popover.Panel>
        </Popover>
    );
}

export default RateInfoPopover;