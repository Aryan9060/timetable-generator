import React from 'react'

function SideBar({ ENTITY_CONFIG, masterData, activeEntity, setActiveEntity, setEditingEntityId }) {

    const MASTER_ENTITY_KEYS = Object.keys(ENTITY_CONFIG);



    return (
        <div className="space-y-4">
            {/* <button className='bg-primary hover:bg-secondary w-full p-2 rounded-lg font-bold text-white shadow '>Generate TimeTable</button> */}

            <h2 className="px-3 text-xs font-semibold text-text/60 uppercase tracking-wider">
                Master Entities
            </h2>
            <div className="space-y-1">
                {MASTER_ENTITY_KEYS.map((key) => {
                    const cfg = ENTITY_CONFIG[key];
                    const count = masterData[key]?.length || 0;
                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => {
                                setActiveEntity(key);
                                setEditingEntityId(null);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors duration-200 ease-in-out ${activeEntity === key
                                ? "bg-primary/10 text-primary font-semibold"
                                : "text-text hover:bg-surface-hover"
                                }`}
                        >
                            <span>{cfg.pluralLabel}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${activeEntity === key ? 'bg-primary/20 text-primary' : 'bg-surface-hover text-text/60'}`}>{count}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    )
}

export default SideBar