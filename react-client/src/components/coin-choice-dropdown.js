import { Fragment, useRef, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { SelectorIcon } from '@heroicons/react/solid';


const CoinChoiceDropDown = ({ selectedCoin, coinList, setSelectedCoin }) => {
    return (
        <Listbox value={selectedCoin} onChange={setSelectedCoin} className="flex justify-end w-24 text-center">
            <div className="relative">
                <Listbox.Button className="flex items-center">
                    {selectedCoin.name}
                    <SelectorIcon
                        className="w-6 h-6"
                        aria-hidden="true"
                    />
                </Listbox.Button>
                <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Listbox.Options className="absolute py-1 mt-3 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {coinList.map((person, personIdx) => (
                            <Listbox.Option
                                key={personIdx}
                                className={({ active }) =>
                                    `cursor-default select-none relative py-2 px-3 pr-4 ${active ? 'text-amber-900 bg-amber-100' : 'text-gray-900'
                                    }`
                                }
                                value={person}
                            >
                                {({ selected }) => (
                                    <>
                                        <span
                                            className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                                                }`}
                                        >
                                            {person.name}
                                        </span>
                                    </>
                                )}
                            </Listbox.Option>
                        ))}
                    </Listbox.Options>
                </Transition>
            </div>
        </Listbox>
    );
}

export default CoinChoiceDropDown;